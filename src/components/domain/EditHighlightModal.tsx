"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ArrowUp, ArrowDown, Trash2, Image as ImageIcon, ListOrdered, Info } from "lucide-react"

export interface ArchivedStoryItem {
  id: string;
  background?: { type: string; value: string } | null;
  overlays?: any[] | null;
  caption?: string | null;
  story_media?: { media_id?: string; storage_path?: string; media?: { storage_path?: string } }[];
  recipe?: { id: string; name: string; recipe_media?: { media?: { storage_path?: string } }[] } | null;
  session?: { id: string; session_media?: { media?: { storage_path?: string } }[] } | null;
}

export function EditHighlightModal({
  highlight,
  archivedStories,
  onClose
}: {
  highlight: { id: string; name: string; cover_url?: string; stories?: any[] };
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

  // Merge archivedStories and any stories already in the highlight to ensure no story is missing from pool
  const allStoriesPool = [...(archivedStories || []), ...(highlight.stories || [])];
  const uniqueStories = allStoriesPool.filter((story, index, self) => 
    index === self.findIndex(s => s.id === story.id)
  );

  const getMediaStoragePath = (s: any): string | null => {
    // 1. Direct story media
    const directPath = s.story_media?.[0]?.media?.storage_path || s.story_media?.[0]?.storage_path;
    if (directPath) return directPath;

    // 2. Linked recipe media
    const recipePath = s.recipe?.recipe_media?.[0]?.media?.storage_path;
    if (recipePath) return recipePath;

    // 3. Linked session media
    const sessionPath = s.session?.session_media?.[0]?.media?.storage_path;
    if (sessionPath) return sessionPath;

    return null;
  }

  const getMediaUrl = (s: any, storagePath?: string | null): string | null => {
    const signed = s?.story_media?.[0]?.media?.signed_url || s?.recipe?.recipe_media?.[0]?.media?.signed_url || s?.session?.session_media?.[0]?.media?.signed_url;
    if (signed) return signed;
    if (!storagePath) return null;
    if (storagePath.startsWith('http')) return storagePath;
    return `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${storagePath}`;
  }

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        if (coverId === id) setCoverId(null);
        return next;
      } else {
        return [...prev, id];
      }
    });
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
    if (!isValid || loading) return
    setLoading(true)
    try {
      const finalTitle = name.trim() || highlight.name || "Destacada";
      
      // 1. Resolve cover URL
      let coverUrl: string | undefined = undefined;
      const effectiveCoverId = coverId && selectedIds.includes(coverId) ? coverId : selectedIds[0];
      const coverStory = uniqueStories.find(s => s.id === effectiveCoverId);
      const path = coverStory ? getMediaStoragePath(coverStory) : null;
      if (path && coverStory) coverUrl = getMediaUrl(coverStory, path) || undefined;

      // 2. Persist cleanly via server action with revalidation
      const { editStoryHighlight } = await import("@/app/actions/highlights");
      await editStoryHighlight(highlight.id, finalTitle, selectedIds, coverUrl);

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
      const { deleteHighlight } = await import("@/app/actions/stories");
      await deleteHighlight(highlight.id);
      router.refresh();
      onClose();
    } catch (e) {
      console.error("Error deleting highlight:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card border border-border text-foreground w-full max-w-sm sm:max-w-md rounded-3xl p-4 sm:p-5 flex flex-col h-[85vh] max-h-[640px] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="shrink-0 mb-3">
          <h2 className="font-bold text-lg text-foreground mb-3 font-serif">Editar Destacada</h2>
          
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              Título <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input 
              type="text" 
              placeholder="Nombre de la colección..." 
              className="border border-border rounded-xl p-3 bg-background w-full text-foreground outline-none focus:border-primary text-sm transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-border mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('select')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'select' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Historias ({selectedIds.length})
            </button>
            <button
              type="button"
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
        </div>

        {/* Tab 1: Selection & Cover */}
        {activeTab === 'select' && (
          uniqueStories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-semibold text-muted-foreground">No tienes historias en tu archivo para añadir.</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 min-h-0 grid grid-cols-3 gap-2.5 p-1 mb-3 content-start auto-rows-max">
              {uniqueStories.map(s => {
                const isSelected = selectedIds.includes(s.id);
                const path = getMediaStoragePath(s);
                const url = getMediaUrl(s, path);
                const isCover = coverId ? coverId === s.id : (selectedIds[0] === s.id && !coverId);
                const textOverlay = s.overlays?.find((o: any) => o.type === 'TEXT');
                const bgValue = s.background?.type === 'color' ? s.background.value : undefined;

                return (
                  <div 
                    key={s.id} 
                    className={`w-full aspect-[3/4] relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-150 border-2 ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/40 shadow-md scale-[0.98]' 
                        : 'border-border/60 opacity-80 hover:opacity-100 hover:border-border'
                    }`}
                    style={{ backgroundColor: bgValue || '#18181B' }}
                    onClick={() => toggle(s.id)}
                  >
                    {url ? (
                      <img src={url} alt="Story" className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        {textOverlay?.payload?.text ? (
                          <span className="text-[11px] font-bold text-white line-clamp-3 break-words">
                            {textOverlay.payload.text}
                          </span>
                        ) : s.recipe?.name ? (
                          <span className="text-[11px] font-semibold text-white/90 line-clamp-2">
                            {s.recipe.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">
                            Historia
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Selection Badge with Order number */}
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-[10px] shadow-md z-10">
                        {selectedIds.indexOf(s.id) + 1}
                      </div>
                    )}
                    
                    {/* Cover selection badge */}
                    {isSelected && (
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCoverId(s.id); }}
                        className={`absolute bottom-1.5 inset-x-1.5 text-[9px] py-0.5 px-1 font-bold rounded-lg text-center transition-colors shadow-md z-10 whitespace-nowrap truncate ${
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
          )
        )}

        {/* Tab 2: Reorder Sequence */}
        {activeTab === 'order' && (
          <div className="overflow-y-auto flex-1 min-h-0 flex flex-col gap-1.5 mb-3 p-1">
            {selectedIds.map((id, index) => {
              const story = uniqueStories.find(s => s.id === id);
              const path = story ? getMediaStoragePath(story) : null;
              const url = story ? getMediaUrl(story, path) : null;
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
                      type="button"
                      onClick={() => moveStory(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-background hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
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

        {/* Validation hint when button is disabled */}
        {!isValid && (
          <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-muted-foreground pb-2 px-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>Selecciona al menos una historia para tu destacada.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="shrink-0 flex gap-2 justify-between pt-3 border-t border-border mt-auto">
          <button 
            type="button"
            onClick={() => setShowConfirm(true)} 
            disabled={loading} 
            className="px-3 py-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose} 
              disabled={loading} 
              className="px-4 py-2.5 rounded-xl bg-muted text-foreground hover:bg-muted/80 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={save} 
              disabled={loading || !isValid} 
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-sm"
            >
              {loading ? "Guardando..." : selectedIds.length > 0 ? `Guardar (${selectedIds.length})` : "Guardar"}
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

