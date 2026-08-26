"use client"

import { Button } from "@/components/ui/button"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

export function ProfileFollowButton({ 
  isAuthenticated, 
  followStatus, 
  targetId, 
  isPrivate 
}: { 
  isAuthenticated: boolean, 
  followStatus: string | null, 
  targetId: string, 
  isPrivate: boolean 
}) {
  const { showAuthPrompt } = useAuthPrompt()

  if (!isAuthenticated) {
    return (
      <Button 
        type="button"
        onClick={() => showAuthPrompt("Crea tu cuenta para seguir a este usuario.")}
        className="min-w-[120px] rounded-full font-bold shadow-sm"
      >
        Seguir
      </Button>
    )
  }

  return null // we'll use the server form if authenticated for simplicity
}
