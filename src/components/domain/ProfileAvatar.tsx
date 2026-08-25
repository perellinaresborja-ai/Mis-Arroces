"use client"

import { useState } from "react"
import { User, X } from "lucide-react"

export function ProfileAvatar({ avatarUrl, username }: { avatarUrl: string | null, username: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        className={`w-full h-full bg-muted rounded-full overflow-hidden ${avatarUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={() => avatarUrl && setIsOpen(true)}
        title={avatarUrl ? "Ver foto de perfil" : undefined}
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary/50">
            <User className="w-10 h-10" />
          </div>
        )}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </>
  )
}
