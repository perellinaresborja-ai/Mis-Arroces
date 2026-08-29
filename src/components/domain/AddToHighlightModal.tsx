"use client"
import { useState, useEffect } from "react"
import { getProfileHighlights, addStoryToHighlight, createAndAddHighlight } from "@/app/actions/highlights"
import { X, Plus } from "lucide-react"

export function AddToHighlightModal({ storyId, coverUrl, currentUserId, onClose }: { storyId: string, coverUrl?: string, currentUserId: string, onClose: () => void }) {
  const [highlights, setHighlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getProfileHighlights(currentUserId).then(h => {
      setHighlights(h)
      setLoading(false)
    })
  }, [currentUserId])

  const handleAdd = async (highlightId: string) => {
    setAddingTo(highlightId)
    await addStoryToHighlight(highlightId, storyId)
    alert('Añadida a destacadas')
    onClose()
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const fullCoverUrl = coverUrl && !coverUrl.startsWith('http') ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/media/${coverUrl}` : coverUrl;
    await createAndAddHighlight(newName, storyId, fullCoverUrl)
    alert('Añadida a destacadas')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-auto" onClick={onClose}>
      <div 
        className="w-full md:max-w-sm bg-zinc-900 rounded-t-3xl md:rounded-3xl flex flex-col max-h-[80vh] border border-white/10 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Añadir a destacadas</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        {showNew ? (
          <div className="p-4 flex flex-col gap-4">
            <input 
              autoFocus
              type="text" 
              placeholder="Nombre de la nueva destacada..." 
              className="border border-white/20 rounded-xl p-3 bg-black/50 w-full text-white outline-none focus:border-primary"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors">Atrás</button>
              <button onClick={handleCreate} disabled={creating || !newName.trim()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50">Crear y añadir</button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto p-2 flex flex-col gap-1">
            <button 
              onClick={() => setShowNew(true)}
              className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors text-white w-full text-left"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-white/50" />
              </div>
              <span className="font-bold">Nueva destacada</span>
            </button>

            {loading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : highlights.map(h => (
              <button 
                key={h.id}
                onClick={() => handleAdd(h.id)}
                disabled={addingTo !== null}
                className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors text-white w-full text-left disabled:opacity-50"
              >
                <div className="w-14 h-14 rounded-full bg-black/50 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  {h.cover_url ? (
                    <img src={h.cover_url.startsWith('http') ? h.cover_url : "https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/" + h.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/30 font-bold text-xl">{h.name.charAt(0)}</span>
                  )}
                </div>
                <span className="font-bold flex-1 truncate">{h.name}</span>
                {addingTo === h.id && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
