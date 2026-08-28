"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { createPost } from "@/app/actions/social"
import { v4 as uuidv4 } from "uuid"

export function PostForm({ recipes }: { recipes: { id: string, name: string }[] }) {
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
      const postId = uuidv4()
      formData.append("id", postId)
      
      if (selectedMedia.length > 0) {
        // Upload all media
        const uploadedIds = await Promise.all(
          selectedMedia.map(m => uploadMedia(m.file, 'posts', postId))
        )
        // Send a JSON string of media IDs in order
        formData.append("media_ids", JSON.stringify(uploadedIds))
      }

      await createPost(formData)
    } catch (err: any) {
      console.error(err)
      setIsSubmitting(false)
      setErrorMsg(err.message || "Error al publicar. Inténtalo de nuevo.")
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
        <Label>Fotos (Opcional, Max 10)</Label>
        <MediaUploader 
          context="posts" 
          maxItems={10} 
          onMediaChange={setSelectedMedia} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Texto</Label>
        <textarea 
          id="content"
          name="content"
          required
          maxLength={2200}
          placeholder="Escribe lo que quieras compartir..."
          className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right">Max 2200 caracteres</p>
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

      <div className="space-y-2">
        <Label htmlFor="visibility">Privacidad</Label>
        <select name="visibility" id="visibility" className="w-full h-12 px-3 rounded-xl border border-input bg-background">
          <option value="PUBLIC">Público</option>
          <option value="FOLLOWERS">Solo Seguidores</option>
          <option value="PRIVATE">Solo Yo / Personas Concretas</option>
        </select>
      </div>

      <Button type="submit" className="w-full h-14 text-lg rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar"}
      </Button>

    </form>
  )
}

