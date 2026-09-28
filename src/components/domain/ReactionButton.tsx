"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { PaellaIcon } from "@/components/icons/PaellaIcon"
import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/app/actions/interactions"
import { usePathname } from "next/navigation"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { LikesModal, prefetchEntityLikes } from "@/components/domain/LikesModal"

interface ReactionButtonProps {
  entityType: "recipe" | "session" | "post"
  entityId: string
  reactions?: { emoji: string; user_id: string }[]
  initialGroupedReactions?: Record<string, number>
  initialMyReaction?: string | null
  className?: string
  iconClassName?: string
  currentUserId: string | null
}

const EMPTY_REACTIONS: { emoji: string; user_id: string }[] = []

export function ReactionButton({ 
  entityType, 
  entityId, 
  reactions = EMPTY_REACTIONS,
  initialGroupedReactions,
  initialMyReaction,
  className,
  iconClassName,
  currentUserId
}: ReactionButtonProps) {
  const { showAuthPrompt } = useAuthPrompt()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [optimisticReactions, setOptimisticReactions] = useState(reactions || EMPTY_REACTIONS)
  const [optGrouped, setOptGrouped] = useState<Record<string, number>>(initialGroupedReactions || {})
  const [optMyReaction, setOptMyReaction] = useState<string | null>(initialMyReaction || null)
  const useGroupedMode = initialGroupedReactions !== undefined

  useEffect(() => {
    if (reactions && reactions.length > 0) {
      setOptimisticReactions(reactions)
    }
  }, [reactions])

  useEffect(() => {
    if (initialGroupedReactions !== undefined) {
      setOptGrouped(prev => {
        if (JSON.stringify(prev) === JSON.stringify(initialGroupedReactions)) return prev
        return initialGroupedReactions
      })
    }
  }, [initialGroupedReactions])

  useEffect(() => {
    if (initialMyReaction !== undefined) {
      setOptMyReaction(prev => prev === initialMyReaction ? prev : initialMyReaction)
    }
  }, [initialMyReaction])
  
  const [showReactionMenu, setShowReactionMenu] = useState(false)
  const [showReactionAnim, setShowReactionAnim] = useState(false)
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false)

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const preventClickRef = useRef(false)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const clearTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const startLongPressTimer = () => {
    clearTimer()
    isLongPressRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      preventClickRef.current = true
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([30])
        } catch {}
      }
      setShowReactionMenu(true)
    }, 450)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    startLongPressTimer()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const diffX = Math.abs(touch.clientX - touchStartPos.current.x)
    const diffY = Math.abs(touch.clientY - touchStartPos.current.y)
    if (diffX > 10 || diffY > 10) {
      clearTimer()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimer()
    if (isLongPressRef.current) {
      e.preventDefault()
      setTimeout(() => {
        isLongPressRef.current = false
        preventClickRef.current = false
      }, 300)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      touchStartPos.current = { x: e.clientX, y: e.clientY }
      startLongPressTimer()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const diffX = Math.abs(e.clientX - touchStartPos.current.x)
    const diffY = Math.abs(e.clientY - touchStartPos.current.y)
    if (diffX > 10 || diffY > 10) {
      clearTimer()
    }
  }

  const handleMouseUp = () => {
    clearTimer()
  }

  const handleMouseLeave = () => {
    clearTimer()
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current || preventClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      isLongPressRef.current = false
      preventClickRef.current = false
      return
    }

    handleReact('🥘')
  }

  const handleReact = (emoji: string) => {
    if (!currentUserId) {
      showAuthPrompt("Inicia sesión para reaccionar.")
      return
    }
    
    // Only celebrate with large animation when actively giving 🥘
    if (emoji === '🥘' && myReaction !== '🥘') {
      setShowReactionAnim(true)
      setTimeout(() => setShowReactionAnim(false), 800)
    }
    
    setShowReactionMenu(false)
    
    if (useGroupedMode) {
      setOptGrouped(prev => {
        const next = { ...prev }
        if (optMyReaction) {
          next[optMyReaction] = Math.max(0, (next[optMyReaction] || 0) - 1)
          if (next[optMyReaction] === 0) delete next[optMyReaction]
        }
        if (optMyReaction !== emoji) {
          next[emoji] = (next[emoji] || 0) + 1
        }
        return next
      })
      setOptMyReaction(prev => prev === emoji ? null : emoji)
    } else {
      setOptimisticReactions(prev => {
        const existingIdx = prev.findIndex(r => r.user_id === currentUserId)
        if (existingIdx !== -1) {
          if (prev[existingIdx].emoji === emoji) {
            return prev.filter(r => r.user_id !== currentUserId)
          } else {
            const newArr = [...prev]
            newArr[existingIdx] = { ...newArr[existingIdx], emoji }
            return newArr
          }
        } else {
          return [...prev, { emoji, user_id: currentUserId }]
        }
      })
    }
    
    startTransition(async () => {
      try {
        await toggleLike(entityType, entityId, emoji, pathname)
      } catch (e) {}
    })
  }

  const groupReactions = () => {
    if (useGroupedMode) {
      return Object.entries(optGrouped).map(([em, count]) => [
        em, 
        { count, hasMine: optMyReaction === em }
      ] as [string, { count: number, hasMine: boolean }]).sort((a, b) => b[1].count - a[1].count)
    }
    const counts: Record<string, { count: number, hasMine: boolean }> = {}
    optimisticReactions.forEach(r => {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, hasMine: false }
      counts[r.emoji].count += 1
      if (r.user_id === currentUserId) counts[r.emoji].hasMine = true
    })
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count)
  }

  const grouped = groupReactions()
  const hasReactions = grouped.length > 0
  
  // Find if user has a reaction
  const myReaction = useGroupedMode ? optMyReaction : optimisticReactions.find(r => r.user_id === currentUserId)?.emoji
  const totalLikes = useGroupedMode 
    ? Object.values(optGrouped).reduce((sum, count) => sum + count, 0)
    : optimisticReactions.length

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* ADD REACTION BUTTON */}
      <button 
        type="button"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowReactionMenu(true)
        }}
        aria-label={myReaction ? `Reacción actual: ${myReaction}` : "Reaccionar con Me gusta"}
        title={myReaction ? "Quitar reacción (mantén pulsado para más)" : "Me gusta (mantén pulsado para más)"}
        className={cn(
          "inline-flex items-center justify-center hover:opacity-70 transition-opacity select-none touch-manipulation", 
          className
        )}
      >
        <span 
          className={cn(
            "inline-flex items-center justify-center transition-transform duration-300",
            myReaction === '🥘' ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105"
          )}
        >
          {myReaction === '🥘' || !myReaction ? (
            <PaellaIcon filled={myReaction === '🥘'} className={cn("w-6 h-6", iconClassName)} />
          ) : (
            <span className={cn("text-xl leading-none", iconClassName)}>{myReaction}</span>
          )}
        </span>
      </button>

      {/* CONTADOR DE ME GUSTA VISIBLE */}
      {totalLikes > 0 ? (
        <button
          type="button"
          onPointerEnter={() => prefetchEntityLikes(entityType, entityId)}
          onTouchStart={() => prefetchEntityLikes(entityType, entityId)}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setIsLikesModalOpen(true)
          }}
          className={cn(
            "text-sm font-medium transition-colors hover:underline cursor-pointer select-none touch-manipulation",
            myReaction ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
          title="Ver personas a las que les gusta"
          aria-label={`Ver las ${totalLikes} personas a las que les gusta`}
        >
          {totalLikes}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          Me gusta
        </button>
      )}

      {/* PÍLDORAS SECUNDARIAS SI HAY VARIEDAD DE EMOJIS */}
      {hasReactions && grouped.length > 1 && (
        <div className="flex flex-wrap gap-1 items-center ml-1">
          {grouped.filter(([em]) => em !== (myReaction || '🥘')).slice(0, 2).map(([emoji, data]) => (
            <button
              key={emoji}
              type="button"
              onPointerEnter={() => prefetchEntityLikes(entityType, entityId)}
              onTouchStart={() => prefetchEntityLikes(entityType, entityId)}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsLikesModalOpen(true)
              }}
              className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground border border-border/50 transition-colors"
              title={`Ver personas con reacción ${emoji}`}
              aria-label={`Ver las ${data.count} personas con reacción ${emoji}`}
            >
              <span>{emoji}</span>
              <span className="font-semibold text-[11px]">{data.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* POPUP MENU */}
      {showReactionMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowReactionMenu(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-card border border-border shadow-xl rounded-full px-3 py-2 flex items-center gap-3 z-50 animate-in fade-in zoom-in-95 duration-200">
            {['🥘', '😂', '🔥', '👏', '😮'].map(em => (
              <button key={em} onClick={() => handleReact(em)} className="text-2xl hover:scale-125 transition-transform active:scale-95 leading-none">
                {em}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ANIMATION (PAELLA ONLY) */}
      {showReactionAnim && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          <span className="text-[8rem] animate-out fade-out zoom-out duration-1000 zoom-in-50">🥘</span>
        </div>
      )}

      {/* LIKES MODAL */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        initialTotalCount={totalLikes}
      />
    </div>
  )
}
