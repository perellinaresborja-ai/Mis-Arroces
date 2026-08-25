// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { createStory } from "@/app/actions/stories"

export function StoryForm({ recipes }: { recipes: { id: string, name: string }[] }) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMsg(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const caption = formData.get("caption") as string
      const recipeId = formData.get("recipeId") as string
      
      let mediaId = undefined;

      if (selectedMedia.length > 0) {
        mediaId = await uploadMedia(selectedMedia[0].file, 'stories', 'temp_' + Date.now())
      }

      await createStory({
        mediaId,
        caption,
        recipeId: recipeId || undefined
      })
      // Action redirects or we can redirect here
      window.location.href = "/";
    } catch (err: any) {
      console.error(err)
      setIsSubmitting(false)
      setErrorMsg(err.message || "Error al publicar la historia. Inténtalo de nuevo.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <Label>Foto o Vídeo (Requerido)</Label>
        <MediaUploader 
          context="stories" 
          maxItems={1} 
          onMediaChange={setSelectedMedia} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Texto corto (Opcional)</Label>
        <textarea 
          id="caption"
          name="caption"
          maxLength={150}
          placeholder="¿Qué estás preparando?..."
          className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right">Max 150 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipeId">Vincular Receta (Opcional)</Label>
        <select name="recipeId" id="recipeId" className="w-full h-12 px-3 rounded-xl border border-input bg-background">
          <option value="">No vincular receta</option>
          {recipes?.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full h-14 text-lg rounded-xl" disabled={isSubmitting || selectedMedia.length === 0}>
        {isSubmitting ? "Publicando..." : "Subir a mi historia"}
      </Button>
    </form>
  )
}
