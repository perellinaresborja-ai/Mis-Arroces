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

  // Track request sequence to prevent race conditions
  const requestIdRef = useRef(0)

  const fetchAvatarForUser = async (userId: string | null, targetRequestId: number) => {
    console.log("[AUTH DEBUG] fetchAvatarForUser START", { userId, targetRequestId })
    if (!userId) {
      if (requestIdRef.current === targetRequestId) {
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
        setAvatarUrl(null)
      }
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select(`avatar:media_assets!fk_profiles_avatar(storage_path)`)
        .eq("id", userId)
        .single()

      const avatarData: any = data?.avatar
      const avatarPath = Array.isArray(avatarData) ? avatarData[0]?.storage_path : avatarData?.storage_path
      console.log("[AUTH DEBUG] profile response", {
        userId,
        "avatar storage_path": avatarPath,
        error: error ? error.message : null
      })

      // Ensure this response matches the latest active request
      if (requestIdRef.current !== targetRequestId) {
        console.log("[AUTH DEBUG] ignoring stale response", { targetRequestId, current: requestIdRef.current })
        return
      }

      if (avatarPath) {
        const fullUrl = avatarPath.startsWith("http")
          ? avatarPath
          : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: fullUrl })
        setAvatarUrl(fullUrl)
      } else {
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
        setAvatarUrl(null)
      }
    } catch (err: any) {
      console.log("[AUTH DEBUG] profile response error", { userId, error: err?.message })
      if (requestIdRef.current === targetRequestId) {
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
        setAvatarUrl(null)
      }
    }
  }

  const syncAuth = async () => {
    const currentReq = ++requestIdRef.current
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      console.log("[AUTH DEBUG] syncAuth run", {
        pathname,
        "user id obtenido o null": currentUser ? currentUser.id : null
      })

      if (requestIdRef.current !== currentReq) return

      setUser(currentUser)
      if (currentUser) {
        await fetchAvatarForUser(currentUser.id, currentReq)
      } else {
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
        setAvatarUrl(null)
      }
    } catch (err: any) {
      console.log("[AUTH DEBUG] syncAuth error", err)
      if (requestIdRef.current === currentReq) {
        setUser(null)
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
        setAvatarUrl(null)
      }
    } finally {
      if (requestIdRef.current === currentReq) {
        setIsLoading(false)
      }
    }
  }

  // 1. Sync on mount AND on every route change (e.g. navigation away from /login)
  useEffect(() => {
    console.log("[AUTH DEBUG] provider route effect triggered", { pathname })
    syncAuth()
  }, [pathname])

  // 2. Real-time auth state changes listener
  useEffect(() => {
    console.log("[AUTH DEBUG] provider mounted - subscribing to onAuthStateChange")
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AUTH DEBUG] onAuthStateChange", {
        event,
        "session user id": session?.user ? session.user.id : null
      })
      const currentReq = ++requestIdRef.current
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null)
        console.log("[AUTH DEBUG] setAvatarUrl", { valor: null })
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

