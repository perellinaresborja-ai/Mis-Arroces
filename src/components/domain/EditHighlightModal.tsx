"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function EditHighlightModal({ highlight, archivedStories, onClose }: { highlight: { id: string, name: string, stories?: { id: string }[] }, archivedStories: { id: string, story_media?: { storage_path: string }[] }[], onClose: () => void }) {
  const [name, setName] = useState(highlight.name)
  const [selectedIds, setSelectedIds] = useState<string[]>(highlight.stories?.map((s: { id: string }) => s.id) || [])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const save = async () => {
    if (!name || selectedIds.length === 0) return
    setLoading(true)
    try {
      // 1. Update highlight name
      await supabase.from('story_highlights').update({ name }).eq('id', highlight.id)
      
      // 2. Delete old relations
      await supabase.from('highlight_stories').delete().eq('highlight_id', highlight.id)
      
      // 3. Insert new relations
      const newRelations = selectedIds.map((storyId, idx) => ({
        highlight_id: highlight.id,
        story_id: storyId,
        display_order: idx
      }))
      await supabase.from('highlight_stories').insert(newRelations)

      router.refresh()
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar destacada? Las historias no se borrarán de tu archivo.")) return
    setLoading(true)
    try {
      await supabase.from('story_highlights').delete().eq('id', highlight.id)
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
      <div className="bg-zinc-950 border border-white/10 w-full max-w-sm rounded-2xl p-4 flex flex-col max-h-[80vh]">
        <h2 className="font-bold text-lg mb-4 text-white">Editar Destacada</h2>
        
        <input 
          type="text" 
          placeholder="Nombre..." 
          className="border border-white/20 rounded-xl p-3 mb-4 bg-zinc-900 w-full text-white outline-none focus:border-primary"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-1 mb-4">
          {archivedStories.map(s => {
            const isSelected = selectedIds.includes(s.id);
            const path = s.story_media?.[0]?.storage_path;
            const url = path ? ('https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/' + path) : null;
            return (
              <div 
                key={s.id} 
                className={('aspect-[9/16] bg-zinc-900 relative cursor-pointer ' + (isSelected ? 'ring-2 ring-primary ring-inset' : ''))}
                onClick={() => toggle(s.id)}
              >
                {url && <img src={url} className="w-full h-full object-cover" />}
                {isSelected && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><div className="w-6 h-6 bg-primary rounded-full text-white flex items-center justify-center font-bold text-xs">✓</div></div>}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 justify-between pt-4 border-t border-white/10">
          <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 font-bold">Eliminar</button>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold">Cancelar</button>
            <button onClick={save} disabled={loading || !name || selectedIds.length===0} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
