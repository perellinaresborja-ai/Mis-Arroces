"use client"

import { useState, useTransition } from "react"
import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/app/actions/interactions"
import { usePathname } from "next/navigation"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

interface ReactionButtonProps {
  entityType: "recipe" | "session" | "post"
  entityId: string
  reactions: { emoji: string; user_id: string }[]
  className?: string
  iconClassName?: string
  currentUserId: string | null
}

export function ReactionButton({ 
  entityType, 
  entityId, 
  reactions = [],
  className,
  iconClassName,
  currentUserId
}: ReactionButtonProps) {
  const { showAuthPrompt } = useAuthPrompt()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [optimisticReactions, setOptimisticReactions] = useState(reactions || [])
  const [showReactionMenu, setShowReactionMenu] = useState(false)
  const [showReactionAnim, setShowReactionAnim] = useState(false)

  const handleReact = (emoji: string) => {
    if (!currentUserId) {
      showAuthPrompt("Inicia sesión para reaccionar.")
      return
    }
    
    if (emoji === '🥘') {
      setShowReactionAnim(true)
      setTimeout(() => setShowReactionAnim(false), 800)
    }
    
    setShowReactionMenu(false)
    
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
    
    startTransition(async () => {
      try {
        await toggleLike(entityType, entityId, emoji, pathname)
      } catch (e) {
        // optionally revert, but usually fine
      }
    })
  }

  const groupReactions = () => {
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
  const totalCount = optimisticReactions.length
  
  // Find if user has a reaction
  const myReaction = optimisticReactions.find(r => r.user_id === currentUserId)?.emoji

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* ADD REACTION BUTTON */}
      <button 
        onClick={() => setShowReactionMenu(!showReactionMenu)}
        className={cn("flex items-center gap-1.5 hover:opacity-70 transition-opacity", className)}
      >
        <span 
          className={cn(
            "inline-flex items-center justify-center transition-transform duration-300 text-xl",
            !myReaction && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100",
            myReaction === '🥘' ? "scale-110" : "hover:scale-105",
            iconClassName
          )}
        >
          {myReaction || '🥘'}
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
