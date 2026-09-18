"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateHighlightsOrder } from "@/app/actions/highlights"
import { ArrowUp, ArrowDown, Check, ArrowUpDown } from "lucide-react"

interface HighlightItem {
  id: string;
  name: string;
  cover_url?: string;
}

export function ReorderHighlightsModal({
  highlights,
  onClose
}: {
  highlights: HighlightItem[];
  onClose: () => void;
}) {
  const [items, setItems] = useState<HighlightItem[]>([...highlights])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setItems(newItems);
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const ids = items.map(i => i.id);
      await updateHighlightsOrder(ids);
      router.refresh();
      onClose();
    } catch (e) {
      console.error("Error updating highlights order:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border text-foreground w-full max-w-sm rounded-3xl p-4 flex flex-col max-h-[80vh] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Reordenar destacadas</h2>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          El primer elemento aparecerá a la izquierda de tu perfil. Usa las flechas para reorganizar las colecciones:
        </p>

        <div className="overflow-y-auto flex-1 flex flex-col gap-2 mb-4 pr-0.5">
          {items.map((h, idx) => (
            <div
              key={h.id}
              className="flex items-center gap-3 p-2.5 bg-muted/40 border border-border rounded-2xl text-sm"
            >
              <span className="font-mono font-bold text-muted-foreground w-5 text-center text-xs">
                {idx + 1}
              </span>

              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                {h.cover_url ? (
                  <img
                    src={h.cover_url.startsWith('http') ? h.cover_url : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${h.cover_url}`}
                    alt={h.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground font-bold text-sm">{h.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <span className="font-bold flex-1 truncate">{h.name}</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, 'up')}
                  disabled={idx === 0 || loading}
                  aria-label="Mover arriba / izquierda"
                  className="p-1.5 rounded-xl bg-background hover:bg-muted disabled:opacity-30 border border-border transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 'down')}
                  disabled={idx === items.length - 1 || loading}
                  aria-label="Mover abajo / derecha"
                  className="p-1.5 rounded-xl bg-background hover:bg-muted disabled:opacity-30 border border-border transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-border mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{loading ? "Guardando..." : "Guardar orden"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
