"use client"

import { useState, useTransition } from "react"
import { PaellaLike } from "./PaellaLike"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/app/actions/interactions"
import { useRouter, usePathname } from "next/navigation"

interface LikeButtonProps {
  entityType: "recipe" | "session" | "post"
  entityId: string
  initialIsLiked: boolean
  initialLikeCount: number
  className?: string
  iconClassName?: string
  showCount?: boolean
  isAuthenticated: boolean
}

import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

export function LikeButton({ 
  entityType, 
  entityId, 
  initialIsLiked, 
  initialLikeCount, 
  className,
  iconClassName,
  showCount = true,
  isAuthenticated
}: LikeButtonProps) {
  const { showAuthPrompt } = useAuthPrompt()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  const handleLike = () => {
    if (!isAuthenticated) {
      showAuthPrompt("Inicia sesión para indicar que te gusta.")
      return
    }

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1))

    startTransition(async () => {
      try {
        await toggleLike(entityType, entityId, !newIsLiked, pathname)
      } catch (e) {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikeCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1))
      }
    })
  }

  return (
    <button 
      onClick={handleLike} 
      disabled={isPending}
      className={cn("flex items-center gap-1.5 hover:opacity-70 transition-opacity", className)}
      aria-label={isLiked ? "Ya no me gusta" : "Me gusta"}
    >
      <PaellaLike active={isLiked} className={cn("text-xl", iconClassName)} />
      {showCount && likeCount > 0 && (
        <span className={cn("text-sm font-medium", isLiked ? "text-primary font-bold" : "text-muted-foreground")}>
          {likeCount}
        </span>
      )}
    </button>
  )
}
