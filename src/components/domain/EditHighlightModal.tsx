"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ArrowUp, ArrowDown, Trash2, Image as ImageIcon, ListOrdered, Check } from "lucide-react"

export function EditHighlightModal({
  highlight,
  archivedStories,
  onClose
}: {
  highlight: { id: string; name: string; cover_url?: string; stories?: { id: string }[] };
  archivedStories: any[];
  onClose: () => void;
}) {
  const [name, setName] = useState(highlight.name)
  const [activeTab, setActiveTab] = useState<'select' | 'order'>('select')
  const [selectedIds, setSelectedIds] = useState<string[]>(highlight.stories?.map((s: { id: string }) => s.id) || [])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getMediaStoragePath = (s: any): string | null => {
    return s.story_media?.[0]?.media?.storage_path || 
      s.story_media?.[0]?.storage_path || 
      s.recipe?.recipe_media?.[0]?.media?.storage_path || 
      s.session?.session_media?.[0]?.media?.storage_path || 
      null;
  }

  const getMediaUrl = (storagePath?: string | null) => {
    if (!storagePath) return null;
    if (storagePath.startsWith('http')) return storagePath;
    return `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${storagePath}`;
  }

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const moveStory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedIds.length) return;
    const newIds = [...selectedIds];
    const temp = newIds[index];
    newIds[index] = newIds[targetIndex];
    newIds[targetIndex] = temp;
    setSelectedIds(newIds);
  }

  const isValid = selectedIds.length > 0;

  const save = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      const finalTitle = name.trim() || highlight.name || "Destacada";
      // 1. Resolve cover URL
      let coverUrl: string | undefined = undefined;
      if (coverId && selectedIds.includes(coverId)) {
        const coverStory = archivedStories.find(s => s.id === coverId);
        const path = coverStory ? getMediaStoragePath(coverStory) : null;
        if (path) coverUrl = getMediaUrl(path) || undefined;
      } else if (selectedIds.length > 0) {
        const firstStory = archivedStories.find(s => s.id === selectedIds[0]);
        const path = firstStory ? getMediaStoragePath(firstStory) : null;
        if (path) coverUrl = getMediaUrl(path) || undefined;
      }

      // 2. Update highlight metadata
      const updateData: { name: string; cover_url?: string } = { name: finalTitle };
      if (coverUrl) updateData.cover_url = coverUrl;
      const { error: updateError } = await supabase.from('story_highlights').update(updateData).eq('id', highlight.id);
      if (updateError) throw updateError;
      
      // 3. Re-link stories preserving explicit manual order
      await supabase.from('highlight_stories').delete().eq('highlight_id', highlight.id);
      
      const newRelations = selectedIds.map((storyId, idx) => ({
        highlight_id: highlight.id,
        story_id: storyId,
        display_order: idx
      }));
      const { error: insertError } = await supabase.from('highlight_stories').insert(newRelations);
      if (insertError) throw insertError;

      router.refresh();
      onClose();
    } catch (e) {
      console.error("Error saving highlight:", e);
    } finally {
      setLoading(false);
    }
  }

  const [showConfirm, setShowConfirm] = useState(false);

  const confirmDelete = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await supabase.from('story_highlights').delete().eq('id', highlight.id);
      router.refresh();
      onClose();
    } catch (e) {
      console.error("Error deleting highlight:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border text-foreground w-full max-w-sm sm:max-w-md rounded-3xl p-5 flex flex-col h-[85vh] max-h-[640px] shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="font-bold text-lg mb-3 font-serif">Editar Destacada</h2>
        
        <input 
          type="text" 
          placeholder="Nombre de la colección..." 
          className="border border-border rounded-xl p-3 mb-3 bg-background w-full text-foreground outline-none focus:border-primary text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* Tab Selector */}
        <div className="flex border-b border-border mb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'select' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Historias ({selectedIds.length})
          </button>
          <button
            onClick={() => setActiveTab('order')}
            disabled={selectedIds.length === 0}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors disabled:opacity-40 ${
              activeTab === 'order' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Ordenar ({selectedIds.length})
          </button>
        </div>

        {/* Tab 1: Selection & Cover */}
        {activeTab === 'select' && (
          <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-2.5 mb-3 pr-0.5">
            {archivedStories.map(s => {
              const isSelected = selectedIds.includes(s.id);
              const path = getMediaStoragePath(s);
              const url = getMediaUrl(path);
              const isCover = coverId ? coverId === s.id : (selectedIds[0] === s.id && !coverId);

              return (
                <div 
                  key={s.id} 
                  className={`aspect-[3/4] bg-muted relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-150 border-2 ${
                    isSelected ? 'border-primary ring-2 ring-primary/40 shadow-md scale-[0.98]' : 'border-border/60 opacity-80 hover:opacity-100 hover:border-border'
                  }`}
                  onClick={() => toggle(s.id)}
                >
                  {url ? (
                    <img src={url} alt="Story" className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-center p-2">
                      {s.overlays?.find((o: any) => o.type === 'TEXT')?.payload?.text ? (
                        <span className="text-[11px] font-bold text-white line-clamp-3">
                          {s.overlays.find((o: any) => o.type === 'TEXT').payload.text}
                        </span>
                      ) : s.recipe?.name ? (
                        <span className="text-[11px] font-semibold text-white/90 line-clamp-2">
                          {s.recipe.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Historia</span>
                      )}
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-primary rounded-full text-primary-foreground flex items-center justify-center font-bold text-[10px] shadow-md z-10">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  
                  {isSelected && (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCoverId(s.id); }}
                      className={`absolute bottom-1.5 inset-x-1.5 text-[9px] py-0.5 px-1 font-bold rounded-lg text-center transition-colors shadow-md z-10 ${
                        isCover ? 'bg-primary text-primary-foreground' : 'bg-black/75 text-white/90 hover:bg-black/90'
                      }`}
                    >
                      {isCover ? '★ Portada' : 'Portada'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Reorder Sequence */}
        {activeTab === 'order' && (
          <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 mb-3 pr-0.5">
            {selectedIds.map((id, index) => {
              const story = archivedStories.find(s => s.id === id);
              const path = story ? getMediaStoragePath(story) : null;
              const url = getMediaUrl(path);
              const isCover = coverId ? coverId === id : (selectedIds[0] === id && !coverId);

              return (
                <div
                  key={id}
                  className="flex items-center gap-2 p-2 bg-muted/50 border border-border rounded-xl text-xs"
                >
                  <span className="font-bold text-muted-foreground w-4 text-center">{index + 1}</span>
                  <div className="w-9 h-14 bg-muted rounded-lg overflow-hidden shrink-0 relative">
                    {url ? (
                      <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">Story</div>
                    )}
                    {isCover && (
                      <span className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-[7px] text-center font-bold">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold block truncate">Historia #{index + 1}</span>
                    <span className="text-[10px] text-muted-foreground">{isCover ? 'Portada de destacada' : 'En secuencia'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveStory(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-background hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveStory(index, 'down')}
                      disabled={index === selectedIds.length - 1}
                      className="p-1 rounded bg-background hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2 justify-between pt-3 border-t border-border mt-auto">
          <button 
            onClick={() => setShowConfirm(true)} 
            disabled={loading} 
            className="px-3 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              disabled={loading} 
              className="px-3 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={save} 
              disabled={loading || !isValid} 
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar destacada"
        message="¿Eliminar destacada? Las historias permanecerán guardadas de forma segura en tu archivo."
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
