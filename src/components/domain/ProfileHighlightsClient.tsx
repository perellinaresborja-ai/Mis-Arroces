"use client"

import { MediaImage } from "@/components/domain/MediaImage"
import { useState } from "react"
import { CreateHighlightModal } from "./CreateHighlightModal"
import { EditHighlightModal } from "./EditHighlightModal"
import { ReorderHighlightsModal } from "./ReorderHighlightsModal"
import { StoriesViewer } from "./StoriesViewer"
import { Plus, Pencil, ArrowUpDown } from "lucide-react"

interface HighlightData {
  id: string;
  name: string;
  cover_url?: string;
  user_id?: string;
  sort_order?: number;
  stories?: any[];
}

export function ProfileHighlightsClient({
  highlights,
  archivedStories,
  isMe
}: {
  highlights: any[];
  archivedStories: any[];
  isMe: boolean;
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [showReorder, setShowReorder] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightData | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<HighlightData | null>(null)

  // Filtrar solo destacados con historias válidas
  const visibleHighlights = (highlights || []).filter(
    (h: HighlightData) => h.stories && h.stories.length > 0
  );

  return (
    <div className="w-full max-w-[672px] mx-auto px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Destacadas</h3>
        {isMe && visibleHighlights.length > 1 && (
          <button
            type="button"
            onClick={() => setShowReorder(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Reordenar</span>
          </button>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {isMe && (
          <div 
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group" 
            onClick={() => setShowCreate(true)}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary text-primary bg-primary/10 flex items-center justify-center transition-all group-hover:bg-primary/20 group-hover:scale-105">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Nueva</span>
          </div>
        )}

        {visibleHighlights.map((h: HighlightData) => (
          <div 
            key={h.id} 
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group" 
            onClick={() => setSelectedHighlight(h)}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-border group-hover:border-primary/50 p-0.5 transition-colors">
                <div className="w-full h-full rounded-full bg-card overflow-hidden relative flex items-center justify-center">
                  {h.cover_url ? (
                    <MediaImage 
                      src={h.cover_url} 
                      alt={h.name} 
                      className="w-full h-full object-cover" 
                      fill={true} 
                      variant="highlight"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary/70 text-sm">
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {isMe && (
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingHighlight(h); 
                  }} 
                  aria-label={`Editar ${h.name}`}
                  className="absolute -bottom-0.5 -right-0.5 bg-card border border-border text-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 hover:scale-110 hover:border-primary transition-all"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">{h.name}</span>
          </div>
        ))}
      </div>

      {editingHighlight && (
        <EditHighlightModal 
          highlight={editingHighlight} 
          archivedStories={archivedStories} 
          onClose={() => setEditingHighlight(null)} 
        />
      )}

      {showCreate && (
        <CreateHighlightModal 
          archivedStories={archivedStories} 
          onClose={() => setShowCreate(false)} 
        />
      )}

      {showReorder && (
        <ReorderHighlightsModal
          highlights={visibleHighlights}
          onClose={() => setShowReorder(false)}
        />
      )}

      {selectedHighlight && selectedHighlight.stories && (
        <StoriesViewer 
          stories={selectedHighlight.stories} 
          initialIndex={0} 
          onClose={() => setSelectedHighlight(null)} 
          currentUserId={isMe ? selectedHighlight.user_id : undefined} 
        />
      )}
    </div>
  )
}
