"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { X, Loader2, RefreshCw } from "lucide-react"
import { MediaImage } from "@/components/domain/MediaImage"
import { Button } from "@/components/ui/button"
import { getEntityLikes, EntityLikeUser } from "@/app/actions/interactions"
import { toggleFollow } from "@/app/actions/social"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { cn } from "@/lib/utils"

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: "recipe" | "session" | "post" | "short"
  entityId: string
  currentUserId: string | null
  initialTotalCount?: number
}

function FollowUserButton({
  user,
  currentUserId
}: {
  user: EntityLikeUser
  currentUserId: string | null
}) {
  const { showAuthPrompt } = useAuthPrompt()
  const [status, setStatus] = useState<"ACCEPTED" | "PENDING" | null>(user.followStatus)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setStatus(user.followStatus)
  }, [user.followStatus])

  if (!currentUserId || currentUserId === user.id) {
    return null
  }

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para seguir a este usuario.")
      return
    }

    if (isPending) return

    const prevStatus = status
    const isPrivate = user.privacy_level === "PRIVATE"
    const nextStatus: "ACCEPTED" | "PENDING" | null = status
      ? null
      : isPrivate
      ? "PENDING"
      : "ACCEPTED"

    setStatus(nextStatus)
    setIsPending(true)

    try {
      const res = await toggleFollow(user.id, isPrivate, prevStatus)
      if (res && "status" in res) {
        setStatus(res.status as any)
      }
    } catch (err) {
      console.error("Error al actualizar seguimiento:", err)
      setStatus(prevStatus)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={handleToggleFollow}
      variant={status === "ACCEPTED" ? "secondary" : status === "PENDING" ? "outline" : "default"}
      className={cn(
        "h-8 px-3 text-xs font-semibold rounded-full shadow-xs transition-all shrink-0",
        status === "ACCEPTED"
          ? "bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : status === "PENDING"
          ? "border-border text-muted-foreground hover:bg-muted"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {status === "ACCEPTED" ? "Siguiendo" : status === "PENDING" ? "Pendiente" : "Seguir"}
    </Button>
  )
}

export function LikesModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  currentUserId,
  initialTotalCount
}: LikesModalProps) {
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<EntityLikeUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState<number | null>(initialTotalCount ?? null)

  useEffect(() => {
    if (initialTotalCount !== undefined) {
      setTotalCount(initialTotalCount)
    }
  }, [initialTotalCount])

  const PAGE_SIZE = 30
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadInitialLikes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setOffset(0)
    try {
      const result = await getEntityLikes(entityType, entityId, PAGE_SIZE, 0)
      setUsers(result.users)
      setTotalCount(result.totalCount)
      setHasMore(result.hasMore)
      setOffset(result.users.length)
    } catch (err) {
      console.error("Error loading entity likes:", err)
      setError("No se pudieron cargar los Me gusta. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    if (isOpen) {
      loadInitialLikes()
    } else {
      setUsers([])
      setError(null)
      setTotalCount(null)
    }
  }, [isOpen, loadInitialLikes])

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const result = await getEntityLikes(entityType, entityId, PAGE_SIZE, offset)
      setUsers(prev => {
        const existingIds = new Set(prev.map(u => u.id))
        const newOnes = result.users.filter(u => !existingIds.has(u.id))
        return [...prev, ...newOnes]
      })
      setHasMore(result.hasMore)
      setOffset(prev => prev + result.users.length)
      if (result.totalCount !== undefined) {
        setTotalCount(result.totalCount)
      }
    } catch (err) {
      console.error("Error loading more likes:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Container: Bottom sheet on mobile, centered modal on desktop */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Personas que han dado Me gusta"
        className="relative z-10 w-full bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[82dvh] h-[78dvh] sm:h-[520px] sm:max-h-[85vh] sm:max-w-md animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile handle drag pill */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3 shrink-0 sm:hidden" />

        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Me gusta
            </h2>
            {totalCount !== null && totalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                {totalCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Listado */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1">
          {isLoading && users.length === 0 ? (
            <div className="divide-y divide-border/30">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 gap-3 animate-pulse">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="w-28 h-3.5 bg-muted rounded-full" />
                      <div className="w-20 h-2.5 bg-muted/60 rounded-full" />
                    </div>
                  </div>
                  <div className="w-16 h-8 bg-muted rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadInitialLikes}
                className="rounded-full text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <span className="text-3xl mb-2">🥘</span>
              <p className="text-sm font-semibold text-foreground">Aún no hay Me gusta</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sé la primera persona en reaccionar a esta publicación.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {users.map(u => {
                const avatarUrl = u.avatar?.storage_path
                  ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${u.avatar.storage_path}`
                  : null

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-3 gap-3 first:pt-1 last:pb-1 group"
                  >
                    {/* Perfil clicable que navega a /@username */}
                    <Link
                      href={`/@${u.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity"
                    >
                      <div className="relative w-11 h-11 rounded-full bg-muted shrink-0 overflow-hidden border border-border/50">
                        {avatarUrl && (
                          <MediaImage
                            src={avatarUrl}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            fill={true}
                            variant="avatar"
                            fallbackType="avatar"
                          />
                        )}
                        {/* Pequeño badge discreto con el emoji utilizado */}
                        {u.emoji && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 text-xs bg-background rounded-full px-0.5 border border-border shadow-xs leading-none"
                            title={`Reaccionó con ${u.emoji}`}
                          >
                            {u.emoji}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 truncate">
                        <span className="font-bold text-sm text-foreground truncate group-hover:underline">
                          {u.display_name || `@${u.username}`}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          @{u.username}
                        </span>
                      </div>
                    </Link>

                    {/* Botón Seguir / Siguiendo / Pendiente */}
                    <FollowUserButton user={u} currentUserId={currentUserId} />
                  </div>
                )
              })}

              {/* Paginación: Cargar más */}
              {hasMore && (
                <div className="pt-3 pb-2 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="text-xs font-semibold text-primary hover:underline transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? "Cargando más personas..." : "Ver más personas"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
