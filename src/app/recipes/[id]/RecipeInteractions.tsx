"use client"

import { useState, useTransition } from "react"
import { Bookmark, ChefHat, Send } from "lucide-react"
import { PaellaLike } from "@/components/domain/PaellaLike"
import { cn } from "@/lib/utils"
import { toggleLike, toggleSave, toggleWantToCook } from "@/app/actions/interactions"
import { useRouter, usePathname } from "next/navigation"

interface RecipeInteractionsProps {
  recipeId: string
  initialIsLiked: boolean
  initialLikeCount: number
  initialIsSaved: boolean
  initialIsWantToCook: boolean
  isAuthenticated: boolean
  isOwner: boolean
}

export function RecipeInteractions({
  recipeId,
  initialIsLiked,
  initialLikeCount,
  initialIsSaved,
  initialIsWantToCook,
  isAuthenticated,
  isOwner
}: RecipeInteractionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isWantToCook, setIsWantToCook] = useState(initialIsWantToCook)

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return false
    }
    return true
  }

  const handleLike = () => {
    if (!requireAuth()) return
    const nextVal = !isLiked
    setIsLiked(nextVal)
    setLikeCount(prev => nextVal ? prev + 1 : Math.max(0, prev - 1))
    startTransition(async () => {
      try { await toggleLike("recipe", recipeId, !nextVal, pathname) }
      catch (e) {
        setIsLiked(!nextVal)
        setLikeCount(prev => !nextVal ? prev + 1 : Math.max(0, prev - 1))
      }
    })
  }

  const handleSave = () => {
    if (!requireAuth()) return
    const nextVal = !isSaved
    setIsSaved(nextVal)
    startTransition(async () => {
      try { await toggleSave(recipeId, !nextVal, pathname) }
      catch (e) { setIsSaved(!nextVal) }
    })
  }

  const handleWantToCook = () => {
    if (!requireAuth()) return
    const nextVal = !isWantToCook
    setIsWantToCook(nextVal)
    startTransition(async () => {
      try { await toggleWantToCook(recipeId, !nextVal, pathname) }
      catch (e) { setIsWantToCook(!nextVal) }
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  return (
    <div className="flex items-center gap-4 py-3 border-y border-border my-4">
      {isOwner ? (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <PaellaLike active={false} className="text-2xl" />
            <span className="text-sm font-medium">{likeCount}</span>
          </div>
        </div>
      ) : (
        <>
          <button 
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            <PaellaLike active={isLiked} className="text-2xl" />
            <span className={cn("text-sm font-medium", isLiked ? "text-primary font-bold" : "")}>{likeCount}</span>
          </button>

          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            aria-label={isSaved ? "Quitar de guardados" : "Guardar receta"}
            title={isSaved ? "Guardado" : "Guardar"}
          >
            <Bookmark className={cn("w-6 h-6", isSaved ? "fill-primary text-primary" : "text-foreground")} />
          </button>

          <button 
            onClick={handleWantToCook} 
            disabled={isPending}
            className={cn("flex items-center gap-1.5 hover:opacity-70 transition-opacity border rounded-full px-3 py-1", isWantToCook ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-foreground font-medium")}
            aria-label={isWantToCook ? "Quitar de Quiero cocinar" : "Añadir a Quiero cocinar"}
            title={isWantToCook ? "En Quiero cocinar" : "Quiero cocinar"}
          >
            <ChefHat className="w-4 h-4" />
            <span className="text-sm">Quiero cocinar</span>
          </button>
        </>
      )}

            

            <button 
        onClick={handleShare}
        className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        title="Compartir"
      >
        <Send className="w-6 h-6" strokeWidth={1.5} />
      </button>

      <div className="flex-1" />

      
    </div>
  )
}
