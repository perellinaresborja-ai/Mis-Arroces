"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [isLoading, setIsLoading] = useState(true)

  // Track active user ID and request sequence to prevent redundant calls and race conditions
  const activeUserIdRef = useRef<string | null>(null)
  const previousPathnameRef = useRef<string>(pathname)
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

  const syncAuth = async (forceRefetch = false) => {
    const currentReq = ++requestIdRef.current
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (requestIdRef.current !== currentReq) return

      const currentUserId = currentUser ? currentUser.id : null
      const userChanged = activeUserIdRef.current !== currentUserId

      setUser(currentUser)
      activeUserIdRef.current = currentUserId

      if (currentUser) {
        // Only query profile/avatar if the user actually changed or a force refresh was requested
        if (userChanged || forceRefetch) {
          await fetchAvatarForUser(currentUser.id, currentReq)
        }
      } else {
        setAvatarUrl(null)
      }
    } catch {
      if (requestIdRef.current === currentReq) {
        activeUserIdRef.current = null
        setUser(null)
        setAvatarUrl(null)
      }
    } finally {
      if (requestIdRef.current === currentReq) {
        setIsLoading(false)
      }
    }
  }

  // 1. Route transition sync:
  // Detect transitions away from auth routes (/login, /forgot-password) or when transitioning from anonymous
  useEffect(() => {
    const prevPath = previousPathnameRef.current
    previousPathnameRef.current = pathname

    const wasAuthRoute = prevPath === "/login" || prevPath === "/forgot-password"
    const isAnonymous = activeUserIdRef.current === null

    // If navigating from auth routes or if we don't have an active user, check if session changed
    if (wasAuthRoute || isAnonymous) {
      syncAuth()
    }
  }, [pathname])

  // 2. Real-time auth state changes listener
  useEffect(() => {
    const supabase = createClient()

    // Initial sync on mount
    syncAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentReq = ++requestIdRef.current
      if (event === "SIGNED_OUT" || !session?.user) {
        activeUserIdRef.current = null
        setUser(null)
        setAvatarUrl(null)
        setIsLoading(false)
      } else {
        const sessionUserId = session.user.id
        const userChanged = activeUserIdRef.current !== sessionUserId
        activeUserIdRef.current = sessionUserId
        setUser(session.user)

        if (userChanged) {
          await fetchAvatarForUser(session.user.id, currentReq)
        }
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
        refreshAvatar: () => syncAuth(true),
      }}
    >
      {children}
    </UserSessionContext.Provider>
  )
}

