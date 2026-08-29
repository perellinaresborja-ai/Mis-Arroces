"use client"

import { useState } from "react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { StoriesViewer } from "./StoriesViewer"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { setGlobalStoryDraft } from "@/lib/story-draft"

export function StoriesBar({ groupedStories, currentUser }: { groupedStories: any[], currentUser: any }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    router.push("/create/story");
    // Reset input
    e.target.value = "";
  }
  
  // Si currentUser no tiene historias activas, añadimos un placeholder de "Tu historia" 
  // para que siempre salga el botón de crear.
  const hasMyStories = currentUser && groupedStories.some(g => g.author.id === currentUser.id)
  
  const handleOpenStories = (index: number) => {
    setActiveGroupIndex(index)
  }

  const handleCloseViewer = () => {
    setActiveGroupIndex(null)
  }

  return (
    <>
      <div className="w-full bg-card border border-border p-4 rounded-3xl flex gap-4 overflow-x-auto hide-scrollbar shadow-sm">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
        
        {/* Create Story Button - Only if I don't have active stories, otherwise it's combined with my avatar */}
        {!hasMyStories && currentUser && (
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-[#E69A21]/50 flex items-center justify-center text-[#E69A21]">
              <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-xs font-medium text-center truncate w-16">Tu historia</span>
          </button>
        )}

                {groupedStories.map((group, i) => {
          const isMe = currentUser?.id === group.author.id;
          const showCreate = isMe && group.allSeen;
          
          const firstStory = group.stories[0];
          const coverMedia = firstStory?.story_media?.[0]?.media?.storage_path || 
                             firstStory?.recipe?.recipe_media?.[0]?.media?.storage_path || 
                             firstStory?.session?.session_media?.[0]?.media?.storage_path;
          
          return (
            <div 
              key={group.author.id} 
              onClick={() => handleOpenStories(i)}
              className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0 relative"
            >
              <div className={`w-16 h-16 rounded-full p-0.5 border-2 ${group.allSeen ? 'border-border' : 'border-primary'}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {coverMedia ? (
                    <img src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${coverMedia}`} className="w-full h-full object-cover" />
                  ) : group.author?.avatar?.storage_path ? (
                    <img src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${group.author.avatar.storage_path}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{(group.author?.display_name || group.author?.username || "?").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              {isMe && (
                <div 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute top-10 right-0 w-5 h-5 bg-[#E69A21] text-white rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform"
                >
                  +
                </div>
              )}

              <span className={`text-xs text-center truncate w-16 \${group.allSeen ? 'text-muted-foreground' : 'font-bold'}`}>
                {isMe ? "Tu historia" : group.author?.display_name?.split(" ")[0] || group.author?.username}
              </span>
            </div>
          )
        })}
      </div>

      {activeGroupIndex !== null && (
        <StoriesViewer 
          groupedStories={groupedStories} 
          initialGroupIndex={activeGroupIndex} 
          onClose={handleCloseViewer}
          currentUser={currentUser}
        />
      )}
    </>
  )
}

