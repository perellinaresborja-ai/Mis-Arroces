"use client"
import { useState } from "react"
import { createStoryHighlight } from "@/app/actions/stories"
import { useRouter } from "next/navigation"

export function CreateHighlightModal({ archivedStories, onClose }: { archivedStories: { id: string, story_media?: { storage_path: string }[] }[], onClose: () => void }) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const save = async () => {
    if (!name || selectedIds.length === 0) return
    setLoading(true)
    try {
      const effectiveCoverId = coverId && selectedIds.includes(coverId) ? coverId : selectedIds[0];
      const coverUrl = archivedStories.find(s => s.id === effectiveCoverId)?.story_media?.[0]?.storage_path 
        ? "https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/" + archivedStories.find((s: { id: string, story_media?: { storage_path: string }[] }) => s.id === effectiveCoverId)?.story_media?.[0]?.storage_path
        : undefined;
      await createStoryHighlight(name, selectedIds, coverUrl)
      router.refresh()
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl p-4 flex flex-col max-h-[80vh]">
        <h2 className="font-bold text-lg mb-4">Nueva Destacada</h2>
        
        <input 
          type="text" 
          placeholder="Nombre..." 
          className="border border-border rounded-lg p-2 mb-4 bg-background w-full"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-1 mb-4">
          {archivedStories.map(s => {
            const isSelected = selectedIds.includes(s.id);
            const path = s.story_media?.[0]?.storage_path;
            const url = path ? ('https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/' + path) : null;
            const isCover = coverId ? coverId === s.id : selectedIds[0] === s.id;
            return (
              <div 
                key={s.id} 
                className={('aspect-[9/16] bg-muted relative ' + (isSelected ? 'ring-2 ring-primary ring-inset' : ''))}
              >
                {url && <img src={url} className="w-full h-full object-cover cursor-pointer" onClick={() => toggle(s.id)} />}
                {!url && <div className="w-full h-full cursor-pointer" onClick={() => toggle(s.id)}></div>}
                
                {isSelected && (
                  <div className="absolute top-1 left-1 right-1 flex justify-between items-start pointer-events-none">
                    <div className="w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center font-bold text-[10px] pointer-events-auto">✓</div>
                  </div>
                )}
                
                {isSelected && url && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCoverId(s.id); }}
                    className={`absolute bottom-1 left-1 right-1 text-[10px] py-1 font-bold rounded text-center transition-colors shadow-sm ${isCover ? 'bg-primary text-white' : 'bg-black/50 text-white/80 hover:bg-black/80'}`}
                  >
                    {isCover ? 'Portada' : 'Hacer portada'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-muted text-foreground">Cancelar</button>
          <button onClick={save} disabled={loading || !name || selectedIds.length===0} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Guardar</button>
        </div>
      </div>
    </div>
  )
}
