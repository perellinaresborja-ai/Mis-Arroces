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
import { useModalHistory } from "@/hooks/useModalHistory"

export function StoriesBar({ groupedStories, currentUser }: { groupedStories: any[], currentUser: any }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null)
  const router = useRouter()

  const safeCloseViewer = useModalHistory(
    activeGroupIndex !== null, 
    () => setActiveGroupIndex(null), 
    'storiesViewer'
  );

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
  
  const [initialStoryIndex, setInitialStoryIndex] = useState<number | undefined>(undefined);

  const handleOpenStories = (index: number) => {
    const grp = groupedStories[index];
    const unreadIdx = grp?.stories?.findIndex((s: any) => !s.hasSeen);
    setInitialStoryIndex(unreadIdx !== -1 && unreadIdx !== undefined ? unreadIdx : 0);
    setActiveGroupIndex(index);
  }

  const handleCloseViewer = () => {
    safeCloseViewer()
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
                      unoptimized={true}
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
          
          // Select active story: first unseen story, or the latest story, or fallback to first
          const activeStory = group.stories?.find((s: any) => !s.hasSeen) || 
                              group.stories?.[group.stories.length - 1] || 
                              group.stories?.[0];

          const rawMedia = activeStory?.story_media?.[0]?.media || activeStory?.story_media?.[0];
          const postOverlay = activeStory?.overlays?.find((o: any) => o.type === 'POST');
          const recipeMedia = activeStory?.recipe?.recipe_media?.[0]?.media;
          const sessionMedia = activeStory?.session?.session_media?.[0]?.media;

          const signedUrl = rawMedia?.signed_url;
          const rawPath = rawMedia?.storage_path || 
                          postOverlay?.payload?.coverUrl || 
                          recipeMedia?.storage_path || 
                          sessionMedia?.storage_path;

          let coverUrl: string | null = null;
          if (signedUrl) {
            coverUrl = signedUrl;
          } else if (rawPath) {
            coverUrl = rawPath.startsWith('http') ? rawPath : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${rawPath}`;
          }

          // If active story has no media (e.g. text-only), fallback to another story in the group that has media
          if (!coverUrl && group.stories?.length > 1) {
            const storyWithMedia = group.stories.find((s: any) => s?.story_media?.[0]?.media?.storage_path || s?.overlays?.some((o: any) => o.type === 'POST' && o.payload?.coverUrl));
            if (storyWithMedia) {
              const sm = storyWithMedia.story_media?.[0]?.media || storyWithMedia.story_media?.[0];
              const po = storyWithMedia.overlays?.find((o: any) => o.type === 'POST');
              const p = sm?.storage_path || po?.payload?.coverUrl;
              if (p) coverUrl = p.startsWith('http') ? p : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${p}`;
            }
          }
          
          const authorAvatarPath = group.author?.avatar?.storage_path || (Array.isArray(group.author?.avatar) ? group.author.avatar[0]?.storage_path : null);
          const authorAvatarUrl = authorAvatarPath ? (authorAvatarPath.startsWith('http') ? authorAvatarPath : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${authorAvatarPath}`) : null;
          
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
                        thumbnailPath={rawMedia?.thumbnail_path || (coverUrl.match(/\.(mp4|webm|mov)$/i) ? coverUrl.replace(/\.(mp4|webm|mov)$/i, '.thumb.webp') : null)}
                        alt="Historia"
                        className="w-full h-full object-cover"
                        fill={true}
                        variant="story"
                        unoptimized={true}
                        fallbackType="avatar"
                      />
                    ) : authorAvatarUrl ? (
                      <MediaImage
                        src={authorAvatarUrl}
                        alt={group.author?.display_name || "Autor"}
                        className="w-full h-full object-cover"
                        fill={true}
                        variant="avatar"
                        fallbackType="avatar"
                        unoptimized={true}
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

              <span className={`text-xs text-center truncate w-16 ${group.allSeen ? 'text-muted-foreground' : 'font-bold'}`}>
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
          initialIndex={initialStoryIndex}
          onClose={handleCloseViewer}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
