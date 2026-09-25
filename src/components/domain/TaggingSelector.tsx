"use client"

import { useState, useEffect } from "react"
import { searchUsersForMention } from "@/app/actions/social_features"
import { X, Search, Tag as TagIcon, Check, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TaggedProfile {
  id: string
  username: string
  display_name: string | null
  avatar?: { storage_path: string } | null
}

export function TaggingSelector({ 
  onTagsChange, 
  initialTags = [] 
}: { 
  onTagsChange: (tags: TaggedProfile[]) => void
  initialTags?: TaggedProfile[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<TaggedProfile[]>(initialTags)
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

  const toggleUser = (user: any) => {
    const isSelected = selected.some(s => s.id === user.id)
    let newSelected: TaggedProfile[]
    if (isSelected) {
      newSelected = selected.filter(s => s.id !== user.id)
    } else {
      if (selected.length >= 10) return // Max 10 tags
      newSelected = [...selected, user]
    }
    setSelected(newSelected)
    onTagsChange(newSelected)
  }

  const removeUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = selected.filter(s => s.id !== id)
    setSelected(newSelected)
    onTagsChange(newSelected)
  }

  return (
    <div>
      {selected.length === 0 ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-colors text-sm font-medium text-foreground w-full sm:w-auto"
        >
          <TagIcon className="w-4 h-4 text-primary shrink-0" />
          <span>Etiquetar personas</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <TagIcon className="w-3.5 h-3.5 text-primary" />
              <span>Personas etiquetadas ({selected.length}/10)</span>
            </div>
            {selected.length < 10 && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {selected.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                <span>@{user.username}</span>
                <button
                  type="button"
                  onClick={(e) => removeUser(user.id, e)}
                  aria-label={`Quitar @${user.username}`}
                  className="hover:text-foreground transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Etiquetar personas {selected.length > 0 && `(${selected.length}/10)`}</h3>
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

              {!loading && results.map((user) => {
                const isSelected = selected.some(s => s.id === user.id)
                const avatarUrl = user.avatar?.storage_path 
                  ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`
                  : null

                return (
                  <button 
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user)}
                    disabled={!isSelected && selected.length >= 10}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/70 rounded-xl transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                        {avatarUrl ? (
                          <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <TagIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-sm leading-tight truncate">{user.display_name || `@${user.username}`}</span>
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

              {!loading && results.length === 0 && query.trim().length > 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No se encontraron usuarios.
                </div>
              )}

              {!loading && query.trim().length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs px-6">
                  Escribe un nombre de usuario para buscar y etiquetar hasta 10 personas en esta publicación.
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-border bg-muted/20">
              <Button type="button" onClick={() => setIsOpen(false)} className="w-full font-bold rounded-xl" size="lg">
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
