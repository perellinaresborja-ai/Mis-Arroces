"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { PaellaIcon } from "@/components/icons/PaellaIcon"
import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/app/actions/interactions"
import { usePathname } from "next/navigation"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

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

export function ReactionButton({ 
  entityType, 
  entityId, 
  reactions = [],
  initialGroupedReactions,
  initialMyReaction,
  className,
  iconClassName,
  currentUserId
}: ReactionButtonProps) {
  const { showAuthPrompt } = useAuthPrompt()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [optimisticReactions, setOptimisticReactions] = useState(reactions || [])
  const [optGrouped, setOptGrouped] = useState<Record<string, number>>(initialGroupedReactions || {})
  const [optMyReaction, setOptMyReaction] = useState<string | null>(initialMyReaction || null)
  const useGroupedMode = initialGroupedReactions !== undefined
  
  const [showReactionMenu, setShowReactionMenu] = useState(false)
  const [showReactionAnim, setShowReactionAnim] = useState(false)

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

  return (
    <div className="relative inline-flex items-center gap-2">
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
          "flex items-center gap-1.5 hover:opacity-70 transition-opacity select-none touch-manipulation", 
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
            <span className={cn("text-xl", iconClassName)}>{myReaction}</span>
          )}
        </span>
        {!hasReactions && (
           <span className="text-sm font-medium text-muted-foreground">Me gusta</span>
        )}
      </button>

      {/* REACTION PILLS */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1 items-center">
          {grouped.map(([emoji, data]) => (
            <button 
              key={emoji} 
              onClick={() => handleReact(emoji)}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shadow-sm transition-transform active:scale-95",
                data.hasMine ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'bg-background border-border text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="text-[13px] leading-none">{emoji}</span>
              <span>{data.count}</span>
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
    </div>
  )
}
