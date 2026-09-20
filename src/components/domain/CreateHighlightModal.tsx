"use client"
import { useState } from "react"
import { createStoryHighlight } from "@/app/actions/stories"
import { useRouter } from "next/navigation"
import { Check, Info } from "lucide-react"

export interface ArchivedStoryItem {
  id: string;
  background?: { type: string; value: string } | null;
  overlays?: any[] | null;
  caption?: string | null;
  story_media?: { media_id?: string; storage_path?: string; media?: { storage_path?: string } }[];
  recipe?: { id: string; name: string; recipe_media?: { media?: { storage_path?: string } }[] } | null;
  session?: { id: string; session_media?: { media?: { storage_path?: string } }[] } | null;
}

export function CreateHighlightModal({
  archivedStories,
  onClose
}: {
  archivedStories: ArchivedStoryItem[];
  onClose: () => void;
}) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Filter out any duplicate story IDs
  const uniqueStories = archivedStories.filter((story, index, self) => 
    index === self.findIndex(s => s.id === story.id)
  );

  const getMediaStoragePath = (s: ArchivedStoryItem): string | null => {
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
    })
  }

  const isValid = selectedIds.length > 0;

  const save = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const finalTitle = name.trim() || "Destacada";
      const effectiveCoverId = coverId && selectedIds.includes(coverId) ? coverId : selectedIds[0];
      const coverStory = uniqueStories.find(s => s.id === effectiveCoverId);
      const path = coverStory ? getMediaStoragePath(coverStory) : null;
      const coverUrl = path ? getMediaUrl(coverStory, path) || undefined : undefined;

      await createStoryHighlight(finalTitle, selectedIds, coverUrl);
      router.refresh();
      onClose();
    } catch (e) {
      console.error("Error creating highlight:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card border border-border text-foreground w-full max-w-sm sm:max-w-md rounded-3xl p-4 sm:p-5 flex flex-col h-[85vh] max-h-[640px] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="shrink-0 mb-3">
          <h2 className="font-bold text-lg text-foreground mb-3 font-serif">Nueva Destacada</h2>
          
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              Título <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input 
              type="text" 
              placeholder="Destacada (o escribe: Paellas, Arroces...)" 
              className="border border-border rounded-xl p-3 bg-background w-full text-foreground outline-none focus:border-primary text-sm transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Selecciona historias para tu destacada:
            </p>
            {selectedIds.length > 0 && (
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {selectedIds.length} seleccionada{selectedIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {uniqueStories.length === 0 ? (
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
        )}

        {/* Validation hint when button is disabled */}
        {!isValid && (
          <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-muted-foreground pb-2 px-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>Selecciona al menos una historia para tu destacada.</span>
          </div>
        )}

        <div className="shrink-0 flex gap-2 justify-end pt-3 border-t border-border mt-auto">
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
  );
}
