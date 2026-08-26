"use client"

import { useState, useEffect, useRef } from "react"
import { formatRelativeTime } from "@/lib/utils"
import { X } from "lucide-react"
import { markStoryViewed, fetchStoryViewers } from "@/app/actions/stories"
import Link from "next/link"

export function StoriesViewer({ groupedStories, initialGroupIndex, onClose, currentUser }: any) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0) // 0 to 100 per story
  const [viewers, setViewers] = useState<any[]>([])
  const [showViewers, setShowViewers] = useState(false)

  const currentGroup = groupedStories[groupIndex]
  const currentStory = currentGroup?.stories[storyIndex]
  const isMe = currentUser?.id === currentGroup?.author?.id

  // Navigate next/prev story
  const nextStory = () => {
    if (!currentGroup) return
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((s: number) => s + 1)
    } else if (groupIndex < groupedStories.length - 1) {
      setGroupIndex((g: number) => g + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }

  const prevStory = () => {
    if (!currentGroup) return
    if (storyIndex > 0) {
      setStoryIndex((s: number) => s - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((g: number) => g - 1)
      setStoryIndex(groupedStories[groupIndex - 1].stories.length - 1)
    } else {
      // First story of first user -> close? Or do nothing?
      // Do nothing or maybe close. Let's do nothing but reset progress.
      setProgress(0)
    }
  }

  // Handle Mark Viewed
  useEffect(() => {
    if (currentStory && !isMe) {
      // Ensure we don't spam if already marked, though action handles it
      markStoryViewed(currentStory.id)
    }
    setProgress(0)
    setIsPaused(false)
    setShowViewers(false)
  }, [currentStory, isMe])

  // Handle fetching viewers for owner
  useEffect(() => {
    if (isMe && currentStory) {
      fetchStoryViewers(currentStory.id).then(setViewers)
    }
  }, [currentStory, isMe])

  // Handle Progress Auto-advance
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isPaused || showViewers) return

    const isVideo = currentStory?.story_media?.[0]?.media?.storage_path?.match(/\.(mp4|webm|ogg)$/i)
    let timer: NodeJS.Timeout
    let step = 0

    if (!isVideo) {
      // Image: 5 seconds advance
      const duration = 5000
      const interval = 50
      timer = setInterval(() => {
        step += (interval / duration) * 100
        if (step >= 100) {
          clearInterval(timer)
          nextStory()
        } else {
          setProgress(step)
        }
      }, interval)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [currentStory, isPaused, showViewers]) // Dependencies

  // Video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(p)
    }
  }
  const handleVideoEnded = () => {
    nextStory()
  }

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") nextStory()
      if (e.key === "ArrowLeft") prevStory()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [groupIndex, storyIndex]) // Needs latest state inside closures, wait actually it's fine if we re-bind or use refs, but since effect re-runs it's ok

  if (!currentStory) return null

  const mediaPath = currentStory.story_media?.[0]?.media?.storage_path
  const isVideo = mediaPath?.match(/\.(mp4|webm|ogg)$/i)
  const fullUrl = mediaPath ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${mediaPath}` : ""

  const handlePointerDown = () => setIsPaused(true)
  const handlePointerUp = () => setIsPaused(false)

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex items-center justify-center overscroll-none touch-none">
      <div className="relative w-full h-full max-w-lg md:h-[90vh] md:rounded-3xl md:overflow-hidden bg-zinc-900 shadow-2xl flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 w-full z-10 flex gap-1 p-2 bg-gradient-to-b from-black/50 to-transparent pt-safe">
          {currentGroup.stories.map((s: any, idx: number) => {
            let width = "0%"
            if (idx < storyIndex) width = "100%"
            else if (idx === storyIndex) width = `${progress}%`
            
            return (
              <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width }} />
              </div>
            )
          })}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 w-full z-10 flex items-center justify-between px-4 pt-safe mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
              {currentGroup.author?.avatar?.storage_path ? (
                <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${currentGroup.author.avatar.storage_path}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-muted-foreground text-sm">{(currentGroup.author?.display_name || currentGroup.author?.username || "?").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col drop-shadow-md">
              <span className="font-bold text-sm leading-tight">{currentGroup.author?.display_name || currentGroup.author?.username}</span>
              <span className="text-xs text-white/80">{formatRelativeTime(currentStory.created_at)}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
            <X className="w-6 h-6 drop-shadow-md" />
          </button>
        </div>

        {/* Media Container */}
        <div 
          className="flex-1 relative w-full h-full flex items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {isVideo ? (
            <video 
              ref={videoRef}
              src={fullUrl} 
              autoPlay 
              playsInline 
              muted={false}
              className="w-full h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : (
            <img 
              src={fullUrl} 
              className="w-full h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
            />
          )}

          {/* Invisible Click Zones for navigation (only active if not showing viewers) */}
          {!showViewers && (
            <>
              <div className="absolute top-0 left-0 w-1/3 h-full z-10" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
              <div className="absolute top-0 right-0 w-2/3 h-full z-10" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </>
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-16 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10">
            <p className="text-sm drop-shadow-md">{currentStory.caption}</p>
          </div>
        )}

        {/* Linked Content CTA */}
        {currentStory.recipe_id && (
          <div className="absolute bottom-28 left-0 w-full flex justify-center z-20 pointer-events-none">
            <Link href={`/recipes/${currentStory.recipe_id}`} className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-sm font-bold shadow-lg pointer-events-auto transition-colors border border-white/10">
              Ver receta
            </Link>
          </div>
        )}
        {currentStory.session_id && (
          <div className="absolute bottom-28 left-0 w-full flex justify-center z-20 pointer-events-none">
            <Link href={`/sessions/${currentStory.session_id}`} className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-sm font-bold shadow-lg pointer-events-auto transition-colors border border-white/10">
              Ver resultado
            </Link>
          </div>
        )}

        {/* Owner Viewers Footer */}
        {isMe && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowViewers(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Visto por {currentStory.viewCount || viewers.length}
            </button>
          </div>
        )}

        {/* Viewers Modal (Owner only) */}
        {showViewers && isMe && (
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl z-40 flex flex-col border-t border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="font-bold text-sm flex items-center gap-2"><EyeIcon className="w-4 h-4" /> Vistas ({viewers.length})</h3>
              <button onClick={() => { setShowViewers(false); setIsPaused(false); }} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {viewers.length === 0 ? (
                <p className="text-center text-sm text-white/50 pt-8">Aún no hay visualizaciones.</p>
              ) : (
                viewers.map(v => (
                  <Link href={`/@${v.username}`} key={v.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {v.avatar?.storage_path ? (
                        <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${v.avatar.storage_path}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-muted-foreground text-sm">{(v.display_name || v.username || "?").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{v.display_name || v.username}</p>
                      <p className="text-xs text-white/50">@{v.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
