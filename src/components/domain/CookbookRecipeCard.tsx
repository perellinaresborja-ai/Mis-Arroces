// @ts-nocheck
"use client"

import { useState } from "react"
import Link from "next/link"
import { Globe, Calendar, Share, Loader2, Check, X, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateRecipeStatus } from "@/app/actions/recipes"
import { createStory } from "@/app/actions/stories"
import { useRouter } from "next/navigation"

export function CookbookRecipeCard({ recipe, tab }: { recipe: any, tab: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")

  const mediaArray = recipe.recipe_media
  const sorted = mediaArray ? [...mediaArray].sort((a: any, b: any) => (a.display_order||0) - (b.display_order||0)) : []
  const path = sorted[0]?.media?.storage_path
  const primaryMediaId = sorted[0]?.media_id
  const coverUrl = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${path}` : null

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      await updateRecipeStatus(recipe.id, 'PUBLISHED', null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedule = async () => {
    if(!scheduleDate) return;
    setIsLoading(true)
    try {
      await updateRecipeStatus(recipe.id, 'PUBLISHED', new Date(scheduleDate).toISOString())
      setIsScheduling(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevertDraft = async () => {
    setIsLoading(true)
    try {
      await updateRecipeStatus(recipe.id, 'DRAFT', null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareStory = async () => {
    if (recipe.status === 'DRAFT') {
      alert("Debes publicar la receta antes de poder compartirla en historias.");
      return;
    }
    setIsLoading(true)
    try {
      await createStory({ recipeId: recipe.id, mediaId: primaryMediaId })
      alert("¡Publicado en tus historias con éxito!")
      router.push("/") // Redirigir al inicio donde se ven las historias
    } catch (err) {
      console.error(err)
      alert("Error al compartir en historias")
    } finally {
      setIsLoading(false)
    }
  }

  const isScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date()

  return (
    <div className="flex flex-col w-full group relative">
      <Link 
        href={`/recipes/${recipe.id}`}
        className="aspect-square bg-muted cursor-pointer overflow-hidden border border-border/50 rounded-xl relative block"
      >
        {coverUrl ? (
          <img src={coverUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-card">
            <span className="text-xs font-medium line-clamp-3 text-muted-foreground">{recipe.name}</span>
          </div>
        )}
        
        {tab === 'mine' && (
          <div className="absolute top-1.5 left-1.5 z-10 flex gap-1">
            
            {isScheduled && (
              <span className="bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                Prog
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Actions below the photo for owner */}
      {tab === 'mine' && (
        <div className="mt-1 flex gap-1 justify-between relative z-20 w-full px-0.5">
          {isScheduling ? (
            <div className="flex w-full gap-1 items-center">
              <input 
                type="datetime-local" 
                className="h-7 text-[10px] flex-1 px-1 rounded-md border border-input bg-background" 
                value={scheduleDate} 
                onChange={e => setScheduleDate(e.target.value)} 
              />
              <Button variant="secondary" className="h-7 w-7 px-0 flex-none bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSchedule} disabled={!scheduleDate || isLoading}>
                <Check className="w-3 h-3" />
              </Button>
              <Button variant="ghost" className="h-7 w-7 px-0 flex-none bg-muted/30" onClick={() => setIsScheduling(false)} disabled={isLoading}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex w-full gap-1 mt-1 px-1">
                <Button 
                  className="h-7 px-0 flex-1 text-[9px] sm:text-[10px] font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0" 
                  onClick={handlePublish}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Publicar'}
                </Button>
                
                <Button 
                  className="h-7 px-0 flex-1 text-[9px] sm:text-[10px] font-bold bg-[#166534] hover:bg-[#166534]/90 text-white border-0" 
                  onClick={handleShareStory}
                  disabled={isLoading}
                  style={{ opacity: 1 }}
                >
                  Historias
                </Button>
                
                <Button 
                  className="h-7 px-0 flex-1 text-[9px] sm:text-[10px] font-bold bg-[#A7C98F] hover:bg-[#A7C98F]/90 text-black border-0" 
                  onClick={() => setIsScheduling(true)}
                  disabled={isLoading}
                >
                  Programar
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
