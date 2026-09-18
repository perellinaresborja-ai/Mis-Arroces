"use client"
import { useState, useEffect } from "react"
import { getProfileHighlights, addStoryToHighlight, createAndAddHighlight } from "@/app/actions/highlights"
import { X, Plus, Check } from "lucide-react"

export function AddToHighlightModal({
  storyId,
  coverUrl,
  currentUserId,
  onClose
}: {
  storyId: string;
  coverUrl?: string;
  currentUserId: string;
  onClose: () => void;
}) {
  const [highlights, setHighlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    getProfileHighlights(currentUserId).then(h => {
      setHighlights(h)
      setLoading(false)
    })
  }, [currentUserId])

  const notifyAndClose = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      onClose()
    }, 900)
  }

  const handleAdd = async (highlightId: string) => {
    setAddingTo(highlightId)
    await addStoryToHighlight(highlightId, storyId)
    notifyAndClose("Añadida a destacadas con éxito")
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const fullCoverUrl = coverUrl && !coverUrl.startsWith('http') 
      ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${coverUrl}` 
      : coverUrl;
    await createAndAddHighlight(newName.trim(), storyId, fullCoverUrl)
    notifyAndClose("Destacada creada y añadida")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full md:max-w-sm bg-card text-foreground rounded-t-3xl md:rounded-3xl flex flex-col max-h-[80vh] border border-border animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">Añadir a destacadas</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
        
        {showNew ? (
          <div className="p-4 flex flex-col gap-3">
            <input 
              autoFocus
              type="text" 
              placeholder="Nombre de la nueva destacada..." 
              className="border border-border rounded-xl p-3 bg-background w-full text-foreground outline-none focus:border-primary text-sm"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowNew(false)} 
                disabled={creating}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-xs transition-colors"
              >
                Atrás
              </button>
              <button 
                onClick={handleCreate} 
                disabled={creating || !newName.trim()} 
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {creating ? "Creando..." : "Crear y añadir"}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto p-2 flex flex-col gap-1">
            <button 
              onClick={() => setShowNew(true)}
              className="flex items-center gap-3 p-3 hover:bg-muted rounded-2xl transition-colors text-foreground w-full text-left"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">Nueva destacada</span>
            </button>

            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : highlights.map(h => (
              <button 
                key={h.id}
                onClick={() => handleAdd(h.id)}
                disabled={addingTo !== null}
                className="flex items-center gap-3 p-3 hover:bg-muted rounded-2xl transition-colors text-foreground w-full text-left disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                  {h.cover_url ? (
                    <img 
                      src={h.cover_url.startsWith('http') ? h.cover_url : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${h.cover_url}`} 
                      className="w-full h-full object-cover" 
                      alt={h.name}
                    />
                  ) : (
                    <span className="text-muted-foreground font-bold text-base">{h.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="font-bold text-sm flex-1 truncate">{h.name}</span>
                {addingTo === h.id && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
