"use client"
import { useState } from "react"
import { StoriesViewer } from "@/components/domain/StoriesViewer"

export function ArchiveGrid({ stories }: { stories: any[] }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {stories.map((story, idx) => (
          <div 
            key={story.id} 
            className="aspect-[9/16] bg-muted relative cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedStoryIndex(idx)}
          >
            {story.story_media?.[0]?.storage_path ? (
              <img 
                src={"https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/story_media/" + story.story_media[0].storage_path} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center p-2 text-center text-xs">
                {story.caption || "Historia"}
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
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
          currentUserId={stories[0]?.owner_id} // owner viewing their own
        />
      )}
    </>
  )
}
