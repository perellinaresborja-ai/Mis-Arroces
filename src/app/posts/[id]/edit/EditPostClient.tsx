"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { updatePost } from "@/app/actions/post_options"
import { AutocompleteMenu } from "@/components/domain/AutocompleteMenu"
import { useAutocomplete } from "@/hooks/useAutocomplete"
import { TaggingSelector, TaggedProfile } from "@/components/domain/TaggingSelector"
import { LocationSelector } from "@/components/domain/LocationSelector"
import { CollaboratorSelector, CollaboratorProfile } from "@/components/domain/CollaboratorSelector"
import { RecipeLinkSelector, LinkedRecipeInfo } from "@/components/domain/RecipeLinkSelector"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, Save } from "lucide-react"

export function EditPostClient({
  post,
  initialTags = [],
  initialCollaborator = null,
  initialRecipe = null,
  mediaItems = [],
}: {
  post: any
  initialTags?: TaggedProfile[]
  initialCollaborator?: CollaboratorProfile | null
  initialRecipe?: LinkedRecipeInfo | null
  mediaItems?: any[]
}) {
  const router = useRouter()
  const [content, setContent] = useState(post.content || "")
  const [location, setLocation] = useState<string | null>(post.location || null)
  const [collaborator, setCollaborator] = useState<CollaboratorProfile | null>(initialCollaborator)
  const [taggedUsers, setTaggedUsers] = useState<TaggedProfile[]>(initialTags)
  const [linkedRecipe, setLinkedRecipe] = useState<LinkedRecipeInfo | null>(initialRecipe)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autocomplete = useAutocomplete()

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    autocomplete.handleInput(val, e.target.selectionStart)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!content.trim()) {
      setErrorMsg("El texto de la publicación no puede estar vacío.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await updatePost({
        postId: post.id,
        content: content.trim(),
        location,
        collaboratorId: collaborator?.id || null,
        recipeId: linkedRecipe?.id || null,
        tags: taggedUsers,
      })

      if (res?.success) {
        router.push(`/posts/${post.id}`)
        router.refresh()
        return
      }

      setIsSubmitting(false)
      setErrorMsg("Error al guardar los cambios.")
    } catch (err: any) {
      console.error("Error al actualizar publicación:", err)
      setIsSubmitting(false)
      setErrorMsg(err.message || "Error al actualizar la publicación.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-5 sm:p-7 rounded-3xl shadow-sm">
      {errorMsg && (
        <div className="p-3.5 bg-destructive/10 text-destructive text-sm rounded-2xl border border-destructive/20 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Media Preservation Banner and Preview */}
      {mediaItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3.5 py-2 rounded-2xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Los archivos multimedia se conservan intactos.</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border/50 max-h-80">
            <MediaCarousel items={mediaItems} priority={true} />
          </div>
        </div>
      )}

      {/* Content Textarea with Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-bold">Texto de la publicación</Label>
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
            placeholder="Edita el texto de tu publicación... Usa @ para menciones y # para etiquetas"
            className="flex w-full rounded-2xl border border-input bg-background p-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Usa @ para mencionar y # para temas</span>
          <span>{content.length}/2200</span>
        </div>
      </div>

      {/* Editable Rich Metadata */}
      <div className="space-y-3 pt-2 border-t border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Detalles editables
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

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 text-sm font-semibold hover:bg-muted rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <Button
          type="submit"
          className="px-7 py-3 text-sm font-bold rounded-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Guardar cambios</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
