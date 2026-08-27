"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toggleFollow, blockUser } from "@/app/actions/social"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { UserMinus, Ban } from "lucide-react"

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
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      showAuthPrompt("Crea tu cuenta para seguir a este usuario.")
      return
    }

    if (status === 'ACCEPTED') {
      setShowMenu(!showMenu)
      return
    }

    try {
      setIsPending(true)
      const nextStatus = isPrivate && status !== 'PENDING' ? 'PENDING' : 'ACCEPTED'
      setStatus(status === 'PENDING' ? null : nextStatus)
      
      await toggleFollow(targetId, isPrivate, status)
    } catch (error) {
      console.error(error)
      setStatus(status) // revert
    } finally {
      setIsPending(false)
    }
  }

  const handleUnfollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    try {
      setIsPending(true)
      setStatus(null)
      await toggleFollow(targetId, isPrivate, 'ACCEPTED')
    } catch (error) {
      console.error(error)
      setStatus('ACCEPTED')
    } finally {
      setIsPending(false)
    }
  }

  const handleBlock = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("¿Seguro que quieres bloquear a este usuario? Ya no podréis veros mutuamente.")) return
    setShowMenu(false)
    try {
      setIsPending(true)
      setStatus('BLOCKED')
      await blockUser(targetId)
    } catch (error) {
      console.error(error)
      setStatus('ACCEPTED')
    } finally {
      setIsPending(false)
    }
  }

  if (status === 'BLOCKED') return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        type="button"
        variant={status === 'ACCEPTED' ? 'secondary' : 'outline'}
        size="sm"
        disabled={isPending}
        onClick={handleFollow}
        className={`h-7 px-3 text-xs rounded-full font-bold shadow-sm transition-colors ${status === 'ACCEPTED' ? 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70 border border-transparent' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
      >
        {status === 'ACCEPTED' ? 'Siguiendo' : status === 'PENDING' ? 'Pendiente' : 'Seguir'}
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <button 
            onClick={handleUnfollow} 
            className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border text-foreground transition-colors"
          >
            <UserMinus className="w-4 h-4" /> Dejar de seguir
          </button>
          <button 
            onClick={handleBlock} 
            className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-destructive/10 font-medium text-destructive transition-colors"
          >
            <Ban className="w-4 h-4" /> Bloquear
          </button>
        </div>
      )}
    </div>
  )
}
