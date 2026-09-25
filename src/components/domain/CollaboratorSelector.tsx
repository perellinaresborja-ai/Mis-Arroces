"use client"

import { useState, useEffect } from "react"
import { searchUsersForMention } from "@/app/actions/social_features"
import { X, Search, Users, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CollaboratorProfile {
  id: string
  username: string
  display_name: string | null
  avatar?: { storage_path: string } | null
}

export function CollaboratorSelector({
  collaborator,
  onSelectCollaborator,
}: {
  collaborator: CollaboratorProfile | null
  onSelectCollaborator: (c: CollaboratorProfile | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const delay = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true)
        try {
          const users = await searchUsersForMention(query.trim())
          setResults(users || [])
        } catch {
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(delay)
  }, [query, isOpen])

  const handleSelect = (user: any) => {
    onSelectCollaborator(user)
    setIsOpen(false)
    setQuery("")
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectCollaborator(null)
  }

  return (
    <div>
      {collaborator ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs text-muted-foreground font-medium">Colaborador</span>
              <span className="text-sm font-bold truncate">
                {collaborator.display_name ? `${collaborator.display_name} (@${collaborator.username})` : `@${collaborator.username}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Quitar colaborador"
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-colors text-sm font-medium text-foreground w-full sm:w-auto"
        >
          <Users className="w-4 h-4 text-primary shrink-0" />
          <span>Añadir colaborador</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Añadir colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-border relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar por @usuario o nombre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl bg-background outline-none text-sm focus:border-primary"
              />
            </div>

            <div className="overflow-y-auto flex-1 p-2 divide-y divide-border/40">
              {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Buscando usuarios...</span>
                </div>
              )}

              {!loading && results.length === 0 && query.trim().length > 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No se encontraron usuarios con ese nombre.
                </div>
              )}

              {!loading && query.trim().length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs px-6">
                  Escribe el @nombre de usuario del coautor o colaborador para asociarlo a esta publicación.
                </div>
              )}

              {!loading &&
                results.map((user) => {
                  const isSelected = collaborator?.id === user.id
                  const avatarUrl = user.avatar?.storage_path
                    ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`
                    : null

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelect(user)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/70 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
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
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  )
                })}
            </div>

            <div className="p-3 border-t border-border bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
