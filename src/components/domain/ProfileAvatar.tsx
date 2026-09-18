"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MediaImage } from "./MediaImage"
import { StoriesViewer } from "./StoriesViewer"

export interface ProfileAvatarProps {
  avatarUrl: string | null;
  username: string;
  activeStoryGroup?: {
    author: any;
    stories: any[];
    allSeen: boolean;
    lastUpdated: string;
  } | null;
  isMe?: boolean;
  currentUser?: any;
}

export function ProfileAvatar({
  avatarUrl,
  username,
  activeStoryGroup = null,
  isMe = false,
  currentUser = null
}: ProfileAvatarProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const router = useRouter()

  const hasActiveStories = Boolean(activeStoryGroup && activeStoryGroup.stories.length > 0)
  const allSeen = activeStoryGroup?.allSeen ?? true

  const handleAvatarClick = () => {
    if (hasActiveStories) {
      setIsViewerOpen(true)
    } else if (avatarUrl) {
      setIsPhotoOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleAvatarClick()
    }
  }

  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push("/create/story")
  }

  return (
    <>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ring wrapper if story exists */}
        <div 
          className={`w-full h-full rounded-full transition-all flex items-center justify-center ${
            hasActiveStories 
              ? allSeen 
                ? 'p-[3px] border-[3.5px] border-orange-500/50 hover:scale-[1.01] cursor-pointer' 
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-[4px] shadow-lg shadow-orange-500/25 hover:scale-[1.02] cursor-pointer'
              : ''
          }`}
        >
          <div 
            className={`w-full h-full rounded-full overflow-hidden bg-background relative select-none ${
              hasActiveStories ? 'p-1 bg-background' : ''
            }`}
          >
            <div 
              className={`w-full h-full rounded-full overflow-hidden relative ${
                hasActiveStories 
                  ? 'cursor-pointer hover:opacity-95' 
                  : avatarUrl 
                  ? 'cursor-pointer hover:opacity-90 transition-opacity' 
                  : ''
              }`}
              onClick={handleAvatarClick}
              onKeyDown={handleKeyDown}
              tabIndex={hasActiveStories ? 0 : avatarUrl ? 0 : undefined}
              role={hasActiveStories || avatarUrl ? "button" : undefined}
              aria-label={hasActiveStories ? `Ver historia de ${username}` : avatarUrl ? `Ver foto de perfil de ${username}` : undefined}
              title={hasActiveStories ? `Ver historia de ${username}` : avatarUrl ? "Ver foto de perfil" : undefined}
            >
              <MediaImage 
                src={avatarUrl} 
                alt={username} 
                variant="avatar" 
                fallbackType="avatar" 
                className="object-cover w-full h-full" 
              />
            </div>
          </div>
        </div>

        {/* Plus (+) Button for Owner to create a new Story */}
        {isMe && (
          <button 
            type="button"
            onClick={handleAddStoryClick}
            aria-label="Crear nueva historia"
            title="Crear nueva historia"
            className="absolute bottom-2 right-2 w-9 h-9 bg-[#E69A21] text-white rounded-full border-[3px] border-background flex items-center justify-center text-xl font-bold shadow-md z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            +
          </button>
        )}
      </div>

      {/* Expanded Photo Modal when NO active story */}
      {isPhotoOpen && avatarUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div 
            className="relative w-full max-w-[85vw] sm:max-w-[400px] aspect-square rounded-full overflow-hidden shadow-2xl animate-in zoom-in-90 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaImage 
              src={avatarUrl} 
              alt={username} 
              variant="avatar" 
              fallbackType="avatar" 
              className="object-cover" 
            />
          </div>
        </div>
      )}

      {/* Active Stories Viewer when clicked with active stories */}
      {isViewerOpen && activeStoryGroup && (
        <StoriesViewer 
          groupedStories={[activeStoryGroup]} 
          initialGroupIndex={0} 
          onClose={() => setIsViewerOpen(false)} 
          currentUser={currentUser}
        />
      )}
    </>
  )
}
