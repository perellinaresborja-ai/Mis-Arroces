"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { createPost } from "@/app/actions/social"
import { searchUsersForMention } from "@/app/actions/social_features"
import { v4 as uuidv4 } from "uuid"
import { AutocompleteMenu } from "@/components/domain/AutocompleteMenu"
import { useAutocomplete } from "@/hooks/useAutocomplete"
import { LocationPicker, RecipePicker } from "@/components/domain/stories/StickerPickers"
import {
  MapPin,
  Tag,
  Users,
  ChefHat,
  Globe,
  Lock,
  ChevronRight,
  X,
  Search,
  Check,
  Loader2,
  Plus
} from "lucide-react"

export interface TaggedProfile {
  id: string
  username: string
  display_name: string | null
  avatar?: { storage_path: string } | null
}

export interface CollaboratorProfile {
  id: string
  username: string
  display_name: string | null
  avatar?: { storage_path: string } | null
}

export interface LinkedRecipeInfo {
  id: string
  name: string
  subtitle?: string
}

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

  // Bottom Sheet state
  const [activeSheet, setActiveSheet] = useState<'location' | 'tagging' | 'collaborator' | 'recipe' | 'privacy' | null>(null)

  // Tagging search state
  const [tagQuery, setTagQuery] = useState("")
  const [tagResults, setTagResults] = useState<any[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  // Collaborator search state
  const [collaboratorQuery, setCollaboratorQuery] = useState("")
  const [collaboratorResults, setCollaboratorResults] = useState<any[]>([])
  const [loadingCollaborators, setLoadingCollaborators] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autocomplete = useAutocomplete()

  // Prevent background scrolling when a bottom sheet is open
  useEffect(() => {
    if (activeSheet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeSheet])

  // Debounced search for tagging
  useEffect(() => {
    if (activeSheet !== 'tagging') return
    const delay = setTimeout(async () => {
      if (tagQuery.trim().length > 0) {
        setLoadingTags(true)
        try {
          const users = await searchUsersForMention(tagQuery.trim())
          setTagResults(users || [])
        } catch {
          setTagResults([])
        } finally {
          setLoadingTags(false)
        }
      } else {
        setTagResults([])
      }
    }, 300)
    return () => clearTimeout(delay)
  }, [tagQuery, activeSheet])

  // Debounced search for collaborator
  useEffect(() => {
    if (activeSheet !== 'collaborator') return
    const delay = setTimeout(async () => {
      if (collaboratorQuery.trim().length > 0) {
        setLoadingCollaborators(true)
        try {
          const users = await searchUsersForMention(collaboratorQuery.trim())
          setCollaboratorResults(users || [])
        } catch {
          setCollaboratorResults([])
        } finally {
          setLoadingCollaborators(false)
        }
      } else {
        setCollaboratorResults([])
      }
    }, 300)
    return () => clearTimeout(delay)
  }, [collaboratorQuery, activeSheet])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    autocomplete.handleInput(val, e.target.selectionStart)
  }

  const toggleTagUser = (user: any) => {
    const isAlreadyTagged = taggedUsers.some((u) => u.id === user.id)
    if (isAlreadyTagged) {
      setTaggedUsers(taggedUsers.filter((u) => u.id !== user.id))
    } else {
      if (taggedUsers.length >= 10) return
      setTaggedUsers([...taggedUsers, user])
    }
  }

  const removeTaggedUser = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setTaggedUsers(taggedUsers.filter((u) => u.id !== id))
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-destructive/10 text-destructive text-sm rounded-2xl border border-destructive/20 font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. MEDIA */}
        <div className="w-full">
          <MediaUploader
            context="posts"
            maxItems={10}
            emptyLabel="Añadir fotos o vídeos"
            emptySubLabel="Hasta 10"
            onMediaChange={setSelectedMedia}
          />
        </div>

        {/* 2. TEXTO */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
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
              placeholder="¿Qué arroz has preparado hoy?"
              className="w-full bg-transparent border-0 p-0 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 leading-relaxed resize-none"
            />
          </div>
          <div className="flex justify-end items-center text-xs text-muted-foreground/80 pt-1.5 border-t border-border/40">
            <span>{content.length}/2200</span>
          </div>
        </div>

        {/* 3 & 4. OPCIONES DE LA PUBLICACIÓN + PRIVACIDAD */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60 shadow-sm">
          {/* Ubicación */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveSheet('location')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">Ubicación</span>
            </div>
            <div className="flex items-center gap-2 max-w-[55%] truncate">
              {location ? (
                <span className="text-sm text-foreground font-semibold truncate">{location}</span>
              ) : null}
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            </div>
          </div>

          {/* Etiquetar personas */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveSheet('tagging')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Tag className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">Etiquetar personas</span>
            </div>
            <div className="flex items-center gap-2 max-w-[55%] truncate">
              {taggedUsers.length > 0 ? (
                <span className="text-sm text-foreground font-semibold truncate">
                  {taggedUsers.length === 1
                    ? `@${taggedUsers[0].username}`
                    : `@${taggedUsers[0].username} +${taggedUsers.length - 1}`}
                </span>
              ) : null}
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            </div>
          </div>

          {/* Añadir colaborador */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveSheet('collaborator')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">Añadir colaborador</span>
            </div>
            <div className="flex items-center gap-2 max-w-[55%] truncate">
              {collaborator ? (
                <span className="text-sm text-foreground font-semibold truncate">
                  @{collaborator.username}
                </span>
              ) : null}
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            </div>
          </div>

          {/* Vincular receta */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveSheet('recipe')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ChefHat className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">Vincular receta</span>
            </div>
            <div className="flex items-center gap-2 max-w-[55%] truncate">
              {linkedRecipe ? (
                <span className="text-sm text-foreground font-semibold truncate">
                  {linkedRecipe.name}
                </span>
              ) : null}
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            </div>
          </div>

          {/* Privacidad */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveSheet('privacy')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              {visibility === "PUBLIC" && (
                <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              )}
              {visibility === "FOLLOWERS" && (
                <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              )}
              {visibility === "PRIVATE" && (
                <Lock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              )}
              <span className="text-sm font-medium text-foreground">Privacidad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground font-semibold">
                {visibility === "PUBLIC"
                  ? "Público"
                  : visibility === "FOLLOWERS"
                  ? "Seguidores"
                  : "Privado"}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            </div>
          </div>
        </div>

        {/* 5. PUBLICAR BUTTON */}
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-base shadow-sm transition-all cursor-pointer mt-3"
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

      {/* 6. BOTTOM SHEETS & MODALS */}
      {activeSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setActiveSheet(null)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 z-10">
            {/* Mobile handle indicator */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {activeSheet === 'location' && <MapPin className="w-4 h-4 text-primary" />}
                {activeSheet === 'tagging' && <Tag className="w-4 h-4 text-primary" />}
                {activeSheet === 'collaborator' && <Users className="w-4 h-4 text-primary" />}
                {activeSheet === 'recipe' && <ChefHat className="w-4 h-4 text-primary" />}
                {activeSheet === 'privacy' && <Globe className="w-4 h-4 text-primary" />}
                <h3 className="font-bold text-base text-foreground">
                  {activeSheet === 'location' && 'Ubicación'}
                  {activeSheet === 'tagging' && `Etiquetar personas (${taggedUsers.length}/10)`}
                  {activeSheet === 'collaborator' && 'Añadir colaborador'}
                  {activeSheet === 'recipe' && 'Vincular receta'}
                  {activeSheet === 'privacy' && 'Privacidad'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto">
              {/* UBICACIÓN */}
              {activeSheet === 'location' && (
                <div className="flex flex-col h-[460px]">
                  {location && (
                    <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs truncate">
                        <span className="text-muted-foreground">Seleccionada:</span>
                        <span className="font-semibold text-foreground truncate">{location}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLocation(null)
                          setActiveSheet(null)
                        }}
                        className="text-xs font-semibold text-destructive hover:underline shrink-0 ml-2"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <LocationPicker
                      onSelect={(loc) => {
                        setLocation(loc.title)
                        setActiveSheet(null)
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ETIQUETAR PERSONAS */}
              {activeSheet === 'tagging' && (
                <div className="flex flex-col h-[480px]">
                  <div className="p-3 border-b border-border relative shrink-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar por @usuario o nombre..."
                      value={tagQuery}
                      onChange={(e) => setTagQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-input rounded-xl bg-background outline-none text-sm focus:border-primary"
                    />
                  </div>

                  {taggedUsers.length > 0 && (
                    <div className="p-3 border-b border-border flex flex-wrap gap-1.5 shrink-0 bg-muted/15 max-h-24 overflow-y-auto">
                      {taggedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          <span>@{user.username}</span>
                          <button
                            type="button"
                            onClick={(e) => removeTaggedUser(user.id, e)}
                            className="hover:text-foreground transition-colors p-0.5 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/40">
                    {loadingTags && (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Buscando usuarios...</span>
                      </div>
                    )}

                    {!loadingTags &&
                      tagResults.map((user) => {
                        const isSelected = taggedUsers.some((u) => u.id === user.id)
                        const avatarUrl = user.avatar?.storage_path
                          ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`
                          : null

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleTagUser(user)}
                            disabled={!isSelected && taggedUsers.length >= 10}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/70 rounded-xl transition-colors disabled:opacity-50 text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                                {avatarUrl ? (
                                  <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-sm leading-tight truncate">
                                  {user.display_name || `@${user.username}`}
                                </span>
                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        )
                      })}

                    {!loadingTags && tagResults.length === 0 && tagQuery.trim().length > 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No se encontraron usuarios con ese nombre.
                      </div>
                    )}

                    {!loadingTags && tagQuery.trim().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs px-6">
                        Escribe el nombre o @usuario para buscar y etiquetar hasta 10 personas.
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-border bg-muted/20 shrink-0">
                    <Button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-full font-bold rounded-xl"
                      size="default"
                    >
                      Listo
                    </Button>
                  </div>
                </div>
              )}

              {/* AÑADIR COLABORADOR */}
              {activeSheet === 'collaborator' && (
                <div className="flex flex-col h-[480px]">
                  {collaborator && (
                    <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs truncate">
                        <span className="text-muted-foreground">Colaborador actual:</span>
                        <span className="font-semibold text-foreground truncate">
                          @{collaborator.username}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCollaborator(null)
                          setActiveSheet(null)
                        }}
                        className="text-xs font-semibold text-destructive hover:underline shrink-0 ml-2"
                      >
                        Quitar
                      </button>
                    </div>
                  )}

                  <div className="p-3 border-b border-border relative shrink-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar por @usuario o nombre..."
                      value={collaboratorQuery}
                      onChange={(e) => setCollaboratorQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-input rounded-xl bg-background outline-none text-sm focus:border-primary"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/40">
                    {loadingCollaborators && (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Buscando usuarios...</span>
                      </div>
                    )}

                    {!loadingCollaborators &&
                      collaboratorResults.map((user) => {
                        const isSelected = collaborator?.id === user.id
                        const avatarUrl = user.avatar?.storage_path
                          ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`
                          : null

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setCollaborator(user)
                              setActiveSheet(null)
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/70 rounded-xl transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                                {avatarUrl ? (
                                  <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-sm leading-tight truncate">
                                  {user.display_name || `@${user.username}`}
                                </span>
                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        )
                      })}

                    {!loadingCollaborators &&
                      collaboratorResults.length === 0 &&
                      collaboratorQuery.trim().length > 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No se encontraron usuarios con ese nombre.
                        </div>
                      )}

                    {!loadingCollaborators && collaboratorQuery.trim().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs px-6">
                        Escribe el @nombre de usuario del coautor o colaborador para asociarlo a esta publicación.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VINCULAR RECETA */}
              {activeSheet === 'recipe' && (
                <div className="flex flex-col h-[480px]">
                  {linkedRecipe && (
                    <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs truncate">
                        <span className="text-muted-foreground">Receta vinculada:</span>
                        <span className="font-semibold text-foreground truncate">{linkedRecipe.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedRecipe(null)
                          setActiveSheet(null)
                        }}
                        className="text-xs font-semibold text-destructive hover:underline shrink-0 ml-2"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <RecipePicker
                      onSelect={(r) => {
                        setLinkedRecipe({
                          id: r.id,
                          name: r.title,
                          subtitle: r.subtitle,
                        })
                        setActiveSheet(null)
                      }}
                    />
                  </div>
                </div>
              )}

              {/* PRIVACIDAD */}
              {activeSheet === 'privacy' && (
                <div className="p-3 space-y-2">
                  {/* Público */}
                  <button
                    type="button"
                    onClick={() => {
                      setVisibility("PUBLIC")
                      setActiveSheet(null)
                    }}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors text-left ${
                      visibility === "PUBLIC"
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        visibility === "PUBLIC"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Público</span>
                        {visibility === "PUBLIC" && (
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Cualquier persona dentro o fuera de misarroces puede ver tu publicación.
                      </p>
                    </div>
                  </button>

                  {/* Seguidores */}
                  <button
                    type="button"
                    onClick={() => {
                      setVisibility("FOLLOWERS")
                      setActiveSheet(null)
                    }}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors text-left ${
                      visibility === "FOLLOWERS"
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        visibility === "FOLLOWERS"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Seguidores</span>
                        {visibility === "FOLLOWERS" && (
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Solo las personas que te siguen pueden ver tu publicación.
                      </p>
                    </div>
                  </button>

                  {/* Privado */}
                  <button
                    type="button"
                    onClick={() => {
                      setVisibility("PRIVATE")
                      setActiveSheet(null)
                    }}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors text-left ${
                      visibility === "PRIVATE"
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        visibility === "PRIVATE"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Privado</span>
                        {visibility === "PRIVATE" && (
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Solo tú puedes ver esta publicación.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
