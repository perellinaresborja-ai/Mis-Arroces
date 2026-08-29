"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { updateRecipeStatus } from "@/app/actions/recipes"
import { createStory } from "@/app/actions/stories"
import { Calendar, Globe, Share, Loader2, Check, X, Pencil, MoreVertical, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EntityInsightsModal } from "./EntityInsightsModal"
import { BarChart2 } from "lucide-react"

export function OwnerRecipeActions({ recipeId, status, scheduledFor, primaryMediaId }: { recipeId: string, status: string, scheduledFor: string | null, primaryMediaId?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handlePublishNow = async () => {
    setIsLoading(true)
    try {
      await updateRecipeStatus(recipeId, 'PUBLISHED', null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduleDate) return
    setIsLoading(true)
    try {
      const iso = new Date(scheduleDate).toISOString()
      await updateRecipeStatus(recipeId, 'PUBLISHED', iso)
      setShowSchedule(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevertDraft = async () => {
    setIsLoading(true)
    setMenuOpen(false)
    try {
      await updateRecipeStatus(recipeId, 'DRAFT', null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareStory = async () => {
    if (status === 'DRAFT') {
      alert("Debes publicar la receta antes de poder compartirla en historias.");
      return;
    }
    setIsLoading(true)
    try {
      await createStory({ recipeId: recipeId, mediaId: primaryMediaId })
      alert("¡Publicado en tus historias con éxito!")
      router.push("/")
    } catch (err) {
      console.error(err)
      alert("Error al compartir en historias")
    } finally {
      setIsLoading(false)
    }
  }

  const isScheduled = status === 'PUBLISHED' && scheduledFor && new Date(scheduledFor) > new Date()
  const isPublished = status === 'PUBLISHED' && !isScheduled

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Arroces',
          url: window.location.href
        })
      } catch (err) {}
    }
  }

  return (
    <div className="bg-card border border-border p-4 rounded-2xl mt-4 mb-2 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          {status === 'DRAFT' && <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded-md uppercase tracking-wider">Borrador</span>}
          {isPublished && <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-md uppercase tracking-wider">Publicado</span>}
          {isScheduled && <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-md uppercase tracking-wider">Programado · {new Date(scheduledFor).toLocaleDateString()}</span>}
        </div>
        
        {/* Menu 3-dots */}
        <div className="relative" ref={menuRef}>
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)} className="h-8 w-8 p-0 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg p-1 z-50">
              {isPublished && (
                <button onClick={handleRevertDraft} disabled={isLoading} className="w-full text-left px-3 py-2 text-sm text-destructive font-medium hover:bg-muted rounded-lg transition-colors">
                  Pasar a Borrador (Despublicar)
                </button>
              )}
              {isScheduled && (
                <button onClick={handleRevertDraft} disabled={isLoading} className="w-full text-left px-3 py-2 text-sm text-destructive font-medium hover:bg-muted rounded-lg transition-colors">
                  Cancelar programación
                </button>
              )}
              <Link href={`/recipes/${recipeId}/edit`}>
                <button className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors flex items-center">
                  <Pencil className="w-4 h-4 mr-2" /> Editar avanzada
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {!showSchedule ? (
        <div className="flex flex-wrap gap-2 items-center">
          
          {status === 'DRAFT' && (
            <>
              <Button onClick={handlePublishNow} disabled={isLoading} className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                Publicar
              </Button>
              <Button variant="secondary" onClick={() => setShowSchedule(true)} disabled={isLoading} className="font-semibold shadow-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Programar
              </Button>
              <Link href={`/recipes/${recipeId}/edit`}>
                <Button className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
              </Link>
            <EntityInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        entityType="RECIPE" 
        entityId={recipeId} 
      />
    </>
          )}

          {isPublished && (
            <>
              <Link href={`/recipes/${recipeId}/edit`}>
                <Button className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleShareStory} disabled={isLoading} className="font-semibold shadow-sm">
                <Share className="w-4 h-4 mr-2 text-[#166534]" /> Compartir en Historia
              </Button>
              <Button variant="secondary" onClick={handleNativeShare} className="font-semibold shadow-sm">
                <Share2 className="w-4 h-4 mr-2 text-muted-foreground" /> Compartir
              </Button>
            </>
          )}

          {isScheduled && (
            <>
              <Link href={`/recipes/${recipeId}/edit`}>
                <Button className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
              </Link>
              <Button onClick={handlePublishNow} disabled={isLoading} className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                Publicar ahora
              </Button>
              <Button variant="secondary" onClick={() => setShowSchedule(true)} disabled={isLoading} className="font-semibold shadow-sm">
                Cambiar programación
              </Button>
            </>
          )}

        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center mt-2 p-3 bg-muted/50 rounded-xl border border-border">
          <input 
            type="datetime-local" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-auto"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <Button onClick={handleSchedule} disabled={isLoading || !scheduleDate} className="bg-[#A7C98F] hover:bg-[#A7C98F]/90 text-black font-bold">
            <Check className="w-4 h-4 mr-2" /> Guardar
          </Button>
          <Button onClick={() => setShowSchedule(false)} variant="ghost" disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
