"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { StoriesViewer } from "./StoriesViewer"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { setGlobalStoryDraft } from "@/lib/story-draft"

import { MediaImage } from "@/components/domain/MediaImage"
import { User } from "lucide-react"

export function StoriesBar({ groupedStories, currentUser }: { groupedStories: any[], currentUser: any }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined" && groupedStories && groupedStories.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const storyId = params.get("story")
      if (storyId) {
        const foundIndex = groupedStories.findIndex(g => g.stories?.some((s: any) => s.id === storyId))
        if (foundIndex !== -1) {
          setActiveGroupIndex(foundIndex)
        }
      }
    }
  }, [groupedStories])

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/create/story");
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

  const currentUserAvatarPath = currentUser?.avatar?.storage_path || (Array.isArray(currentUser?.avatar) ? currentUser.avatar[0]?.storage_path : null);
  const currentUserAvatarUrl = currentUserAvatarPath
    ? (currentUserAvatarPath.startsWith('http') ? currentUserAvatarPath : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentUserAvatarPath}`)
    : null;

  return (
    <>
      <div className="w-full bg-card border border-border p-4 rounded-3xl flex gap-4 overflow-x-auto hide-scrollbar shadow-sm">
        
        {/* Create Story Button - Only if I don't have active stories, otherwise it's combined with my avatar */}
        {!hasMyStories && currentUser && (
          <div 
            onClick={() => router.push("/create/story")}
            className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-transparent">
                <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                  {currentUserAvatarUrl ? (
                    <MediaImage
                      src={currentUserAvatarUrl}
                      alt="Tu avatar"
                      className="w-full h-full object-cover"
                      fill={true}
                      variant="avatar"
                      fallbackType="avatar"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/60 font-bold">
                      {(currentUser?.display_name || currentUser?.username) ? (
                        <span>{(currentUser.display_name || currentUser.username).charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleAddClick}
                className="absolute bottom-0 right-0 w-6 h-6 bg-[#E69A21] text-white rounded-full border-[3px] border-background flex items-center justify-center text-sm font-bold shadow-sm z-10 cursor-pointer hover:scale-110 transition-transform before:absolute before:-inset-4 before:content-['']"
              >
                +
              </button>
            </div>
            <span className="text-xs font-bold text-center truncate w-16">Tu historia</span>
          </div>
        )}
        {groupedStories.map((group, i) => {
          const isMe = currentUser?.id === group.author.id;
          const showCreate = isMe && group.allSeen;
          
          const firstStory = group.stories[0];
          const coverMedia = firstStory?.story_media?.[0]?.media?.storage_path || 
                             firstStory?.recipe?.recipe_media?.[0]?.media?.storage_path || 
                             firstStory?.session?.session_media?.[0]?.media?.storage_path;
          const coverUrl = coverMedia ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${coverMedia}` : null;
          
          const authorAvatarPath = group.author?.avatar?.storage_path || (Array.isArray(group.author?.avatar) ? group.author.avatar[0]?.storage_path : null);
          const authorAvatarUrl = authorAvatarPath ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${authorAvatarPath}` : null;
          
          return (
            <div 
              key={group.author.id} 
              onClick={() => handleOpenStories(i)}
              className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0"
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-full p-0.5 border-2 ${group.allSeen ? 'border-border' : 'border-primary'}`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                    {coverUrl ? (
                      <MediaImage
                        src={coverUrl}
                        alt="Historia"
                        className="w-full h-full object-cover"
                        fill={true}
                        variant="story"
                      />
                    ) : authorAvatarUrl ? (
                      <MediaImage
                        src={authorAvatarUrl}
                        alt={group.author?.display_name || "Autor"}
                        className="w-full h-full object-cover"
                        fill={true}
                        variant="avatar"
                        fallbackType="avatar"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/60 font-bold">
                        {(group.author?.display_name || group.author?.username) ? (
                          <span>{(group.author.display_name || group.author.username).charAt(0).toUpperCase()}</span>
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {isMe && (
                  <button 
                    onClick={handleAddClick}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#E69A21] text-white rounded-full border-[3px] border-background flex items-center justify-center text-sm font-bold shadow-sm z-10 cursor-pointer hover:scale-110 transition-transform before:absolute before:-inset-4 before:content-['']"
                  >
                    +
                  </button>
                )}
              </div>

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
