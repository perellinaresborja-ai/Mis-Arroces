"use client"

import { useState, useEffect, useRef } from "react"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { createClient } from "@/lib/supabase/client"
import { fetchFeedPage } from "@/app/actions/feed"
import { fetchActiveStories } from "@/app/actions/stories"
import { FeedList } from "@/components/domain/FeedList"
import { StoriesBar } from "@/components/domain/StoriesBar"
import { Flame } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

function FeedSkeleton() {
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0 animate-in fade-in duration-150">
      {/* Stories bar skeleton */}
      <div className="w-full bg-card border border-border rounded-3xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/60 animate-pulse border-2 border-border/40" />
              <div className="w-10 h-2 bg-muted/50 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Feed post card skeleton */}
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs space-y-3 p-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/60 animate-pulse shrink-0 border border-border/40" />
            <div className="space-y-1.5 flex-1">
              <div className="w-28 h-3.5 bg-muted/60 rounded-full animate-pulse" />
              <div className="w-16 h-2.5 bg-muted/40 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Media placeholder */}
          <div className="w-full aspect-[4/3] sm:aspect-square bg-muted/40 rounded-2xl animate-pulse" />

          {/* Action bar and caption */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-muted/50 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-muted/50 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-muted/50 animate-pulse" />
            </div>
            <div className="w-3/4 h-3 bg-muted/50 rounded-full animate-pulse" />
            <div className="w-1/2 h-3 bg-muted/40 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomeSessionGate() {
  const { user, isLoading: sessionLoading } = useUserSession()
  const [resolvedState, setResolvedState] = useState<{
    status: "resolving" | "authenticated" | "anonymous"
    feed: any[]
    stories: any[]
    profile: any | null
    userId: string | null
  }>({
    status: "resolving",
    feed: [],
    stories: [],
    profile: null,
    userId: null,
  })

  const loadAttemptedRef = useRef(false)

  useEffect(() => {
    let isCancelled = false

    async function resolveAndLoad() {
      // 1. Si el contexto aún está cargando la sesión inicial, esperar
      if (sessionLoading && !user) {
        return
      }

      // 2. Si tenemos usuario confirmado
      if (user) {
        loadAttemptedRef.current = true
        try {
          const supabase = createClient()
          const [profileRes, feedData, storiesData] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, onboarding_completed, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
              .eq("id", user.id)
              .single(),
            fetchFeedPage(0, user),
            fetchActiveStories(user),
          ])

          if (isCancelled) return

          setResolvedState({
            status: "authenticated",
            feed: feedData || [],
            stories: storiesData || [],
            profile: profileRes?.data || null,
            userId: user.id,
          })
        } catch (err) {
          console.error("Error cargando feed autenticado en sesión gate:", err)
          if (!isCancelled) {
            setResolvedState((prev) => ({ ...prev, status: "authenticated", userId: user.id }))
          }
        }
        return
      }

      // 3. Si la sesión terminó de cargar y definitivamente NO hay usuario activo
      if (!sessionLoading && !user) {
        loadAttemptedRef.current = true
        try {
          // El dispositivo tenía señal histórica pero todas las sesiones fueron cerradas
          try {
            localStorage.removeItem("ma_has_account")
            document.cookie = "ma_has_account=; path=/; max-age=0"
          } catch {}

          const [feedData, storiesData] = await Promise.all([
            fetchFeedPage(0, null),
            fetchActiveStories(null),
          ])

          if (isCancelled) return

          setResolvedState({
            status: "anonymous",
            feed: feedData || [],
            stories: storiesData || [],
            profile: null,
            userId: null,
          })
        } catch (err) {
          console.error("Error cargando feed público en sesión gate:", err)
          if (!isCancelled) {
            setResolvedState((prev) => ({ ...prev, status: "anonymous" }))
          }
        }
      }
    }

    resolveAndLoad()

    return () => {
      isCancelled = true
    }
  }, [user, sessionLoading])

  // Mientras se resuelve la sesión o se cargan los datos iniciales, mostrar el shell skeleton
  if (resolvedState.status === "resolving") {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
        <FeedSkeleton />
      </div>
    )
  }

  const { feed, stories, profile, userId } = resolvedState

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8 animate-in fade-in duration-150">
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        {/* Stories Bar */}
        {(stories.length > 0 || userId) && (
          <StoriesBar groupedStories={stories} currentUser={profile || user} />
        )}

        {feed.length === 0 && (
          <div className="text-center p-12 bg-card rounded-3xl border border-border mt-8">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Tu muro está vacío</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Sigue a otros arroceros o sé el primero en publicar tu receta.
            </p>
            <Link href="/discover" className={buttonVariants({ variant: "outline", className: "rounded-xl" })}>
              Descubrir recetas
            </Link>
          </div>
        )}

        <FeedList initialItems={feed} currentUserId={userId} />
      </div>
    </div>
  )
}
