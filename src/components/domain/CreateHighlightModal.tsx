"use client"
import { useState } from "react"
import { createStoryHighlight } from "@/app/actions/stories"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

export function CreateHighlightModal({
  archivedStories,
  onClose
}: {
  archivedStories: { id: string; story_media?: { storage_path?: string; media?: { storage_path?: string } }[] }[];
  onClose: () => void;
}) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const getMediaStoragePath = (s: { id: string; story_media?: { storage_path?: string; media?: { storage_path?: string } }[] }) => {
    return s.story_media?.[0]?.storage_path || s.story_media?.[0]?.media?.storage_path;
  }

  const getMediaUrl = (storagePath?: string) => {
    if (!storagePath) return null;
    if (storagePath.startsWith('http')) return storagePath;
    return `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${storagePath}`;
  }

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const save = async () => {
    if (!name.trim() || selectedIds.length === 0) return
    setLoading(true)
    try {
      const effectiveCoverId = coverId && selectedIds.includes(coverId) ? coverId : selectedIds[0];
      const coverStory = archivedStories.find(s => s.id === effectiveCoverId);
      const path = coverStory ? getMediaStoragePath(coverStory) : null;
      const coverUrl = path ? getMediaUrl(path) || undefined : undefined;

      await createStoryHighlight(name.trim(), selectedIds, coverUrl)
      router.refresh()
      onClose()
    } catch (e) {
      console.error("Error creating highlight:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border text-foreground w-full max-w-sm rounded-3xl p-4 flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="font-bold text-lg mb-3">Nueva Destacada</h2>
        
        <input 
          type="text" 
          placeholder="Nombre de la destacada..." 
          className="border border-border rounded-xl p-3 mb-3 bg-background w-full text-foreground outline-none focus:border-primary text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <p className="text-xs text-muted-foreground mb-2">
          Selecciona las historias en el orden en que deseas que aparezcan:
        </p>

        <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-1.5 mb-3 pr-0.5">
          {archivedStories.map(s => {
            const isSelected = selectedIds.includes(s.id);
            const path = getMediaStoragePath(s);
            const url = getMediaUrl(path);
            const isCover = coverId ? coverId === s.id : (selectedIds[0] === s.id && !coverId);

            return (
              <div 
                key={s.id} 
                className={`aspect-[9/16] bg-muted relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary ring-inset' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => toggle(s.id)}
              >
                {url ? (
                  <img src={url} alt="Story" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] text-muted-foreground p-1 text-center">
                    Sin imagen
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-1 left-1 w-5 h-5 bg-primary rounded-full text-primary-foreground flex items-center justify-center font-bold text-[10px] shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                
                {isSelected && url && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCoverId(s.id); }}
                    className={`absolute bottom-1 left-1 right-1 text-[9px] py-0.5 px-1 font-bold rounded text-center transition-colors shadow-sm ${
                      isCover ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white hover:bg-black/80'
                    }`}
                  >
                    {isCover ? 'Portada' : 'Hacer portada'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-border mt-auto">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={save} 
            disabled={loading || !name.trim() || selectedIds.length === 0} 
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
