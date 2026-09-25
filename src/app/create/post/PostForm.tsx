"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { createPost } from "@/app/actions/social"
import { v4 as uuidv4 } from "uuid"
import { AutocompleteMenu } from "@/components/domain/AutocompleteMenu"
import { useAutocomplete } from "@/hooks/useAutocomplete"
import { TaggingSelector, TaggedProfile } from "@/components/domain/TaggingSelector"
import { LocationSelector } from "@/components/domain/LocationSelector"
import { CollaboratorSelector, CollaboratorProfile } from "@/components/domain/CollaboratorSelector"
import { RecipeLinkSelector, LinkedRecipeInfo } from "@/components/domain/RecipeLinkSelector"
import { Globe, Lock, Users, Sparkles, Loader2 } from "lucide-react"

export function PostForm({ recipes }: { recipes: { id: string; name: string }[] }) {
  const router = useRouter()
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [content, setContent] = useState("")
  const [location, setLocation] = useState<string | null>(null)
  const [collaborator, setCollaborator] = useState<CollaboratorProfile | null>(null)
  const [taggedUsers, setTaggedUsers] = useState<TaggedProfile[]>([])
  const [linkedRecipe, setLinkedRecipe] = useState<LinkedRecipeInfo | null>(null)
  const [visibility, setVisibility] = useState<"PUBLIC" | "FOLLOWERS" | "PRIVATE">("PUBLIC")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autocomplete = useAutocomplete()

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    autocomplete.handleInput(val, e.target.selectionStart)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!content.trim()) {
      setErrorMsg("Escribe un texto para tu publicación.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      const postId = uuidv4()
      formData.append("id", postId)
      formData.append("content", content.trim())
      formData.append("visibility", visibility)

      if (location) {
        formData.append("location", location)
      }
      if (collaborator) {
        formData.append("collaborator_id", collaborator.id)
      }
      if (linkedRecipe) {
        formData.append("recipeId", linkedRecipe.id)
      }
      if (taggedUsers.length > 0) {
        formData.append("tagged_users", JSON.stringify(taggedUsers))
      }

      if (selectedMedia.length > 0) {
        // Upload all media
        const uploadedIds = await Promise.all(
          selectedMedia.map((m) => uploadMedia(m.file, "posts", postId))
        )
        formData.append("media_ids", JSON.stringify(uploadedIds))
      }

      const res = await createPost(formData)
      if (res?.success) {
        router.push("/")
        router.refresh()
        return
      }

      setIsSubmitting(false)
      setErrorMsg("Error al publicar. Inténtalo de nuevo.")
    } catch (err: any) {
      if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
        return
      }
      console.error(err)
      setIsSubmitting(false)
      setErrorMsg(err.message || "Error al publicar. Inténtalo de nuevo.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-5 sm:p-7 rounded-3xl shadow-sm">
      {errorMsg && (
        <div className="p-3.5 bg-destructive/10 text-destructive text-sm rounded-2xl border border-destructive/20 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Multimedia Section */}
      <div className="space-y-2">
        <Label className="text-sm font-bold">Fotos y Vídeos (Opcional, hasta 10)</Label>
        <MediaUploader
          context="posts"
          maxItems={10}
          onMediaChange={setSelectedMedia}
        />
      </div>

      {/* Text Section with Mentions & Hashtags Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-bold">Texto</Label>
        <div className="relative">
          <AutocompleteMenu
            isOpen={autocomplete.isOpen}
            type={autocomplete.type}
            suggestions={autocomplete.suggestions}
            onSelect={(val) => {
              const { newText, newCursorPos } = autocomplete.insertSuggestion(content, val)
              setContent(newText)
              if (textareaRef.current) {
                textareaRef.current.focus()
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.selectionStart = newCursorPos
                    textareaRef.current.selectionEnd = newCursorPos
                  }
                }, 0)
              }
            }}
          />
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            value={content}
            onChange={handleContentChange}
            required
            maxLength={2200}
            rows={4}
            placeholder="¿Qué arroz has preparado hoy? Usa @ para mencionar arroceros y # para etiquetas..."
            className="flex w-full rounded-2xl border border-input bg-background p-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Escribe @ para mencionar y # para temas</span>
          <span>{content.length}/2200</span>
        </div>
      </div>

      {/* Interactive Metadata Options */}
      <div className="space-y-3 pt-2 border-t border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Detalles de la publicación
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Ubicación */}
          <LocationSelector
            location={location}
            onSelectLocation={setLocation}
          />

          {/* Colaborador */}
          <CollaboratorSelector
            collaborator={collaborator}
            onSelectCollaborator={setCollaborator}
          />
        </div>

        {/* Personas etiquetadas */}
        <TaggingSelector
          initialTags={taggedUsers}
          onTagsChange={setTaggedUsers}
        />

        {/* Receta vinculada */}
        <RecipeLinkSelector
          recipe={linkedRecipe}
          onSelectRecipe={setLinkedRecipe}
        />
      </div>

      {/* Privacy Selector */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Label htmlFor="visibility" className="text-sm font-bold">Privacidad</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setVisibility("PUBLIC")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold gap-1.5 transition-all ${
              visibility === "PUBLIC"
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Público</span>
          </button>
          <button
            type="button"
            onClick={() => setVisibility("FOLLOWERS")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold gap-1.5 transition-all ${
              visibility === "FOLLOWERS"
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Seguidores</span>
          </button>
          <button
            type="button"
            onClick={() => setVisibility("PRIVATE")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold gap-1.5 transition-all ${
              visibility === "PRIVATE"
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privado</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-14 text-base font-bold rounded-2xl mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Publicando...</span>
          </span>
        ) : (
          "Publicar"
        )}
      </Button>
    </form>
  )
}
