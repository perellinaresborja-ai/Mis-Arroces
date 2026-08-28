"use client"
import { useState } from "react"
import { CreateHighlightModal } from "./CreateHighlightModal"
import { StoriesViewer } from "./StoriesViewer"

export function ProfileHighlightsClient({ highlights, archivedStories, isMe }: { highlights: any[], archivedStories: any[], isMe: boolean }) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null)

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

        {highlights.map((h: any) => (
          <div key={h.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedHighlight(h)}>
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-muted overflow-hidden flex items-center justify-center p-0.5">
               <div className="w-full h-full rounded-full bg-card overflow-hidden">
                 {h.cover_url ? <img src={h.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-muted-foreground/20" />}
               </div>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">{h.name}</span>
          </div>
        ))}
      </div>

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
