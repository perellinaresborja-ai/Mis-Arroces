"use client"
import { useState } from "react"
import { StoriesViewer } from "@/components/domain/StoriesViewer"
import { CreateHighlightModal } from "@/components/domain/CreateHighlightModal"
import { Plus } from "lucide-react"

export function ArchiveGrid({ stories }: { stories: any[] }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)
  const [showCreateHighlight, setShowCreateHighlight] = useState(false)

  return (
    <>
      {stories.length > 0 && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground">{stories.length} {stories.length === 1 ? 'historia' : 'historias'} en archivo</span>
          <button
            onClick={() => setShowCreateHighlight(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear destacada</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        {stories.map((story, idx) => (
          <div 
            key={story.id} 
            className="aspect-[9/16] bg-muted relative cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden"
            onClick={() => setSelectedStoryIndex(idx)}
          >
            {(() => {
              const path = story.story_media?.[0]?.media?.storage_path || story.story_media?.[0]?.storage_path;
              if (path) {
                const url = path.startsWith('http') ? path : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${path}`;
                return <img src={url} alt="Story" className="w-full h-full object-cover" />;
              }
              return (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center p-2 text-center text-xs text-muted-foreground">
                  {story.caption || "Historia"}
                </div>
              );
            })()}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
              {new Date(story.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      
      {selectedStoryIndex !== null && (
        <StoriesViewer 
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
          currentUserId={stories[0]?.owner_id}
        />
      )}

      {showCreateHighlight && (
        <CreateHighlightModal
          archivedStories={stories}
          onClose={() => setShowCreateHighlight(false)}
        />
      )}
    </>
  )
}
