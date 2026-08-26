"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MediaItem {
  id: string
  storage_path: string
}

export function MediaCarousel({ items, bucket = "recipe_media" }: { items: MediaItem[], bucket?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  if (!items || items.length === 0) return null

  // Supabase public URL prefix
  const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
  const getImageUrl = (path: string) => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`

  const next = () => setCurrentIndex(prev => (prev + 1) % items.length)
  const prev = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length)

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
      <Image src={getImageUrl(items[currentIndex].storage_path)} alt={`Media ${currentIndex + 1}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" priority={currentIndex === 0} />

      {items.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white scale-125" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

