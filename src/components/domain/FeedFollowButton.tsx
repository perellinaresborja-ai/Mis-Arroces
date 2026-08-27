"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleFollow } from "@/app/actions/social"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

export function FeedFollowButton({ 
  isAuthenticated, 
  initialStatus, 
  targetId, 
  isPrivate 
}: { 
  isAuthenticated: boolean, 
  initialStatus: string | null, 
  targetId: string, 
  isPrivate: boolean 
}) {
  const { showAuthPrompt } = useAuthPrompt()
  const [status, setStatus] = useState<string | null>(initialStatus)
  const [isPending, setIsPending] = useState(false)



  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      showAuthPrompt("Crea tu cuenta para seguir a este usuario.")
      return
    }

    try {
      setIsPending(true)
      // Optimistic update
      const nextStatus = isPrivate ? 'PENDING' : 'ACCEPTED'
      setStatus(status === 'PENDING' ? null : nextStatus)
      
      await toggleFollow(targetId, isPrivate, status)
      
      if (status === 'PENDING') {
        
      } else if (isPrivate) {
        
      } else {
        
      }
    } catch (error) {
      console.error(error)
      
      setStatus(status) // revert
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      type="button"
      variant={status === 'ACCEPTED' ? 'secondary' : 'outline'}
      size="sm"
      disabled={isPending}
      onClick={handleFollow}
      className={`h-7 px-3 text-xs rounded-full font-bold shadow-sm transition-colors ${status === 'ACCEPTED' ? 'bg-secondary/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-transparent' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
    >
      {status === 'ACCEPTED' ? 'Siguiendo' : status === 'PENDING' ? 'Pendiente' : 'Seguir'}
    </Button>
  )
}
