"use client"

import { useState } from "react"
import { MediaImage } from "./MediaImage"

export function ProfileAvatar({ avatarUrl, username }: { avatarUrl: string | null, username: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        className={`w-full h-full rounded-full overflow-hidden relative ${avatarUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={() => avatarUrl && setIsOpen(true)}
        title={avatarUrl ? "Ver foto de perfil" : undefined}
      >
        <MediaImage 
          src={avatarUrl} 
          alt={username} 
          variant="avatar" 
          fallbackType="avatar" 
          className="object-cover" 
        />
      </div>

      {isOpen && avatarUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-[85vw] sm:max-w-[400px] aspect-square rounded-full overflow-hidden shadow-2xl animate-in zoom-in-90 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaImage 
              src={avatarUrl} 
              alt={username} 
              variant="detail"
              fallbackType="avatar"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </>
  )
}
