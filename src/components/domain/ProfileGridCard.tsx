"use client"

import { MessageCircle, Pin } from "lucide-react"
import { PaellaIcon } from "@/components/icons/PaellaIcon"
import { SocialElaborationModal } from "./SocialElaborationModal"
import { useState } from "react"
import { MediaImage } from "./MediaImage"

export function ProfileGridCard({ item, currentUserId }: { item: any, currentUserId: string | undefined }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // determine image
  let imagePath = null
  const mediaList = item.recipe_media || item.session_media || item.post_media
  if (mediaList && mediaList.length > 0) {
    const sorted = [...mediaList].sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    imagePath = sorted[0]?.media?.storage_path
  }
  const imageUrl = imagePath ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${imagePath}` : null

  // determine link
  let badge = null
  if (item.entity_type === 'session') {
    badge = "Cocinado"
  } else if (item.entity_type === 'post') {
    badge = "Post"
  }

  return (
    <>
      <div 
        className="w-full h-full group relative aspect-square bg-muted cursor-pointer overflow-hidden border border-border/50 rounded-xl"
        onClick={() => setIsModalOpen(true)}
      >
        <MediaImage 
          src={imageUrl} 
          alt={item.name || item.content || "Media"} 
          variant="feed"
          fallbackType="recipe"
          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
        />
        
        {item.is_pinned && (
          <div className="absolute top-1.5 left-1.5 z-10 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none">
            <Pin className="w-3.5 h-3.5 fill-current transform rotate-45" />
          </div>
        )}
        
        {/* Subtle badge for specific content types */}
        {badge && (
          <div className="absolute top-1.5 right-1.5 z-10 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none">
            {badge === 'Cocinado' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            )}
          </div>
        )}
        
        {/* Desktop Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white z-20">
          <div className="flex items-center gap-1.5">
            <PaellaIcon className="w-5 h-5 text-white" />
            <span className="font-bold">{item.likeCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 text-white fill-white" />
            <span className="font-bold">{item.commentCount}</span>
          </div>
        </div>
      </div>

      <SocialElaborationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        currentUserId={currentUserId}
      />
    </>
  )
}
