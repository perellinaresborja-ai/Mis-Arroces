"use client"

import { useState, useEffect } from "react"
import { searchUsersForMention } from "@/app/actions/social_features"
import { X, Search, Tag as TagIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TaggingSelector({ 
  onTagsChange, 
  initialTags = [] 
}: { 
  onTagsChange: (tags: any[]) => void
  initialTags?: any[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any[]>(initialTags)

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length > 0) {
        const users = await searchUsersForMention(query)
        setResults(users)
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(delay)
  }, [query])

  const toggleUser = (user: any) => {
    const isSelected = selected.some(s => s.id === user.id)
    let newSelected
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
      <div 
        onClick={() => setIsOpen(true)}
        className="flex flex-wrap gap-2 items-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors min-h-[56px]"
      >
        <TagIcon className="w-5 h-5 text-muted-foreground shrink-0" />
        {selected.length === 0 ? (
          <span className="text-muted-foreground text-sm">Etiquetar personas...</span>
        ) : (
          selected.map(user => (
            <div key={user.id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              @{user.username}
              <button onClick={(e) => removeUser(user.id, e)} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl flex flex-col max-h-[80vh] m-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">Etiquetar personas {selected.length > 0 && `(${selected.length}/10)`}</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 border-b relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                autoFocus
                placeholder="Buscar usuario..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl bg-transparent outline-none focus:border-primary"
              />
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {results.map(user => {
                const isSelected = selected.some(s => s.id === user.id)
                return (
                  <button 
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    disabled={!isSelected && selected.length >= 10}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                        {user.avatar?.storage_path && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`} className="w-full h-full object-cover" alt="" />
                        )}
                      </div>
                      <div className="text-left flex flex-col">
                        <span className="font-bold text-sm leading-tight">{user.display_name || `@${user.username}`}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                )
              })}
              {results.length === 0 && query.length > 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No se encontraron usuarios.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <Button onClick={() => setIsOpen(false)} className="w-full font-bold rounded-xl" size="lg">
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
