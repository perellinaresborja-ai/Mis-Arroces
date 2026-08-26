"use client"

import { useState } from "react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { StoriesViewer } from "./StoriesViewer"

export function StoriesBar({ groupedStories, currentUser }: { groupedStories: any[], currentUser: any }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null)
  
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
        
        {/* Create Story Button - Only if I don't have active stories, otherwise it's combined with my avatar */}
        {!hasMyStories && currentUser && (
          <Link href="/create/story" className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary/50 flex items-center justify-center text-primary/50">
              <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-xs font-medium text-center truncate w-16">Tu historia</span>
          </Link>
        )}

        {groupedStories.map((group, i) => {
          const isMe = currentUser?.id === group.author.id;
          const showCreate = isMe && group.allSeen; // Optionally show + on own seen stories? Not strictly needed.
          
          return (
            <div 
              key={group.author.id} 
              onClick={() => handleOpenStories(i)}
              className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0 relative"
            >
              <div className={`w-16 h-16 rounded-full p-0.5 border-2 \${group.allSeen ? 'border-border' : 'border-primary'}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {group.author?.avatar?.storage_path ? (
                    <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${group.author.avatar.storage_path}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{(group.author?.display_name || group.author?.username || "?").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              {isMe && (
                <div className="absolute top-10 right-0 w-5 h-5 bg-primary text-primary-foreground rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm pointer-events-none">
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
