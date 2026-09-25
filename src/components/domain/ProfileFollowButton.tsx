"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { toggleFollow } from "@/app/actions/social"

export function ProfileFollowButton({ 
  isAuthenticated, 
  followStatus: initialStatus, 
  targetId, 
  isPrivate,
  className
}: { 
  isAuthenticated: boolean, 
  followStatus: string | null, 
  targetId: string, 
  isPrivate: boolean,
  className?: string
}) {
  const { showAuthPrompt } = useAuthPrompt()
  const [status, setStatus] = useState<string | null>(initialStatus)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      showAuthPrompt("Crea tu cuenta para seguir a este usuario.")
      return
    }

    if (isPending) return // Bloqueo estricto contra doble pulsación concurrente

    try {
      setIsPending(true)
      const previousStatus = status
      // Actualización optimista inmediata en la UI
      const nextStatus = status ? null : (isPrivate ? 'PENDING' : 'ACCEPTED')
      setStatus(nextStatus)

      await toggleFollow(targetId, isPrivate, previousStatus)
    } catch (err) {
      console.error("Error al actualizar seguimiento:", err)
      setStatus(status) // Revertir en caso de fallo
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      variant={status === 'ACCEPTED' ? 'outline' : status === 'PENDING' ? 'secondary' : 'default'} 
      className={className || "min-w-[120px] rounded-full font-bold shadow-sm transition-opacity disabled:opacity-50"}
    >
      {status === 'ACCEPTED' ? 'Siguiendo' : status === 'PENDING' ? 'Solicitud enviada' : 'Seguir'}
    </Button>
  )
}
