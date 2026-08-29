"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { useState } from "react"
import { CreateHighlightModal } from "./CreateHighlightModal"
import { EditHighlightModal } from "./EditHighlightModal"

interface HighlightData {
  id: string;
  name: string;
  cover_url?: string;
  user_id?: string;
  stories?: any[];
}
interface ArchivedStoryData {
  id: string;
  story_media?: { storage_path: string }[];
}

import { StoriesViewer } from "./StoriesViewer"

export function ProfileHighlightsClient({ highlights, archivedStories, isMe }: { highlights: any[], archivedStories: any[], isMe: boolean }) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightData | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<HighlightData | null>(null)

  return (
    <div className="w-full px-4 mb-6">
      <h3 className="font-bold mb-3 text-sm">Destacadas</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {isMe && (
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowCreate(true)}>
            <div className="w-16 h-16 rounded-full border border-dashed border-primary text-primary bg-primary/10 flex items-center justify-center text-2xl font-light">
              +
            </div>
            <span className="text-xs font-medium">Nueva</span>
          </div>
        )}

        {highlights.map((h: HighlightData) => (
          <div key={h.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedHighlight(h)}>
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-muted overflow-hidden flex items-center justify-center p-0.5">
               <div className="w-full h-full rounded-full bg-card overflow-hidden relative">
                 {h.cover_url ? <MediaImage src={h.cover_url} alt={"Image"} className="w-full h-full object-cover" fill={true} /> : <div className="w-full h-full bg-muted-foreground/20" />}
                 {isMe && <button onClick={(e) => { e.stopPropagation(); setEditingHighlight(h); }} className="absolute -top-1 -right-1 bg-zinc-900 border border-white/20 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 hover:scale-110 transition-transform">✎</button>}
               </div>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">{h.name}</span>
          </div>
        ))}
      </div>

      {editingHighlight && (
        <EditHighlightModal highlight={editingHighlight} archivedStories={archivedStories} onClose={() => setEditingHighlight(null)} />
      )}

      {showCreate && (
        <CreateHighlightModal archivedStories={archivedStories} onClose={() => setShowCreate(false)} />
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
