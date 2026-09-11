"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserSessionContextType {
  user: User | null
  avatarUrl: string | null
  isLoading: boolean
  refreshAvatar: () => Promise<void>
}

const UserSessionContext = createContext<UserSessionContextType>({
  user: null,
  avatarUrl: null,
  isLoading: true,
  refreshAvatar: async () => {},
})

export function useUserSession() {
  return useContext(UserSessionContext)
}

export function UserSessionProvider({
  children,
  initialAvatarUrl = null,
}: {
  children: React.ReactNode
  initialAvatarUrl?: string | null
}) {
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [isLoading, setIsLoading] = useState(true)

  // Track request sequence to prevent race conditions
  const requestIdRef = useRef(0)

  const fetchAvatarForUser = async (userId: string | null, targetRequestId: number) => {
    if (!userId) {
      if (requestIdRef.current === targetRequestId) {
        setAvatarUrl(null)
      }
      return
    }

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select(`avatar:media_assets!fk_profiles_avatar(storage_path)`)
        .eq("id", userId)
        .single()

      // Ensure this response matches the latest active request
      if (requestIdRef.current !== targetRequestId) {
        return
      }

      const avatarData: any = data?.avatar
      const avatarPath = Array.isArray(avatarData) ? avatarData[0]?.storage_path : avatarData?.storage_path
      if (avatarPath) {
        const fullUrl = avatarPath.startsWith("http")
          ? avatarPath
          : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`
        setAvatarUrl(fullUrl)
      } else {
        setAvatarUrl(null)
      }
    } catch {
      if (requestIdRef.current === targetRequestId) {
        setAvatarUrl(null)
      }
    }
  }

  const syncAuth = async () => {
    const currentReq = ++requestIdRef.current
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (requestIdRef.current !== currentReq) return

      setUser(currentUser)
      if (currentUser) {
        await fetchAvatarForUser(currentUser.id, currentReq)
      } else {
        setAvatarUrl(null)
      }
    } catch {
      if (requestIdRef.current === currentReq) {
        setUser(null)
        setAvatarUrl(null)
      }
    } finally {
      if (requestIdRef.current === currentReq) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // 1. Initial sync on mount
    syncAuth()

    // 2. Real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentReq = ++requestIdRef.current
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null)
        setAvatarUrl(null)
        setIsLoading(false)
      } else {
        setUser(session.user)
        await fetchAvatarForUser(session.user.id, currentReq)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserSessionContext.Provider
      value={{
        user,
        avatarUrl,
        isLoading,
        refreshAvatar: syncAuth,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  )
}

