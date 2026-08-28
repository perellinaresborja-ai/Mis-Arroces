"use client"
import { useState } from "react"
import { createStoryHighlight } from "@/app/actions/stories"
import { useRouter } from "next/navigation"

export function CreateHighlightModal({ archivedStories, onClose }: { archivedStories: any[], onClose: () => void }) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const save = async () => {
    if (!name || selectedIds.length === 0) return
    setLoading(true)
    try {
      const coverUrl = archivedStories.find(s => s.id === selectedIds[0])?.story_media?.[0]?.storage_path 
        ? "https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/story_media/" + archivedStories.find((s:any) => s.id === selectedIds[0]).story_media[0].storage_path
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
          {archivedStories.map(s => (
            <div 
              key={s.id} 
              className={"aspect-[9/16] bg-muted relative cursor-pointer " + (selectedIds.includes(s.id) ? 'ring-2 ring-primary ring-inset' : '')}
              onClick={() => toggle(s.id)}
            >
              {s.story_media?.[0]?.storage_path && (
                <img src={"https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/story_media/" + s.story_media[0].storage_path} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-muted text-foreground">Cancelar</button>
          <button onClick={save} disabled={loading || !name || selectedIds.length===0} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Guardar</button>
        </div>
      </div>
    </div>
  )
}
