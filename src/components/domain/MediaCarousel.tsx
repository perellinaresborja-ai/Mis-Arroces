"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import Link from "next/link";
import { VideoThumbnail } from "./VideoThumbnail"

interface MediaItem {
  id: string
  storage_path: string
  media_type?: string // 'IMAGE' or 'VIDEO'
  thumbnail_path?: string | null
}

export function MediaCarousel({ items, bucket = "recipe_media", href, priority = false }: { items: MediaItem[], bucket?: string, href?: string, priority?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  
  if (!items || items.length === 0) return null

  const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
  const getMediaUrl = (path: string) => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`

  const next = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setCurrentIndex(prev => (prev + 1) % items.length) }
  const prev = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setCurrentIndex(prev => (prev - 1 + items.length) % items.length) }
  const toggleMute = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      currentVideo.muted = nextMuted
    }
  }

  // Play current video, pause others (SOLO en vista abierta sin href)
  useEffect(() => {
    if (href) return

    Object.entries(videoRefs.current).forEach(([index, videoEl]) => {
      if (!videoEl) return
      videoEl.defaultMuted = true
      videoEl.muted = isMuted
      if (parseInt(index) === currentIndex) {
        if (isMuted) videoEl.muted = true
        const playPromise = videoEl.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (!videoEl.muted) {
              videoEl.muted = true
              setIsMuted(true)
              videoEl.play().catch(() => {})
            }
          })
        }
      } else {
        videoEl.pause()
        videoEl.currentTime = 0
      }
    })

    return () => {
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) {
          try {
            videoEl.pause()
          } catch {}
        }
      })
    }
  }, [currentIndex, isMuted, href])

  const currentItem = items[currentIndex]
  const isCurrentVideo = !href && Boolean(
    currentItem && (currentItem.media_type === 'VIDEO' || currentItem.storage_path.match(/\.(mp4|webm|mov)$/i))
  )

  const renderMedia = (item: MediaItem, index: number) => {
    const isVideo = item.media_type === 'VIDEO' || item.storage_path.match(/\.(mp4|webm|mov)$/i)
    const url = getMediaUrl(item.storage_path)

    if (isVideo) {
      if (href) {
        // En contexto de feed / lista / previsualización (cuando hay href para abrir el post):
        // El vídeo DEBE ESTAR PARADO como miniatura estática.
        return (
          <VideoThumbnail
            src={url}
            thumbnailPath={item.thumbnail_path}
            className="w-full h-full object-cover"
            fill={true}
            showBadge={true}
            priority={priority && index === 0}
          />
        )
      }

      // En contexto abierto (/posts/[id] o detalle sin href):
      // Aquí sí se reproduce el vídeo al abrirlo.
      return (
        <div className="absolute inset-0 w-full h-full bg-black/10">
          <video
            ref={el => {
              videoRefs.current[index] = el
              if (el) {
                el.defaultMuted = true
                el.muted = isMuted
              }
            }}
            src={url}
            className="w-full h-full object-cover"
            autoPlay={index === currentIndex}
            muted={isMuted}
            preload="auto"
            loop
            playsInline
          >
            <source src={url} type="video/mp4" />
          </video>
        </div>
      )
    }

    return (
      <Image 
        src={url} 
        alt={`Media ${index + 1}`} 
        fill 
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
        className="object-cover" 
        priority={priority && index === 0} 
      />
    )
  }

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
      {href ? (
        <Link href={href} className="absolute inset-0 block">
          {items.map((item, index) => (
            <div key={item.id} className="absolute inset-0" style={{ opacity: index === currentIndex ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: index === currentIndex ? 'auto' : 'none' }}>
              {renderMedia(item, index)}
            </div>
          ))}
        </Link>
      ) : (
        <div className="absolute inset-0">
          {items.map((item, index) => (
            <div key={item.id} className="absolute inset-0" style={{ opacity: index === currentIndex ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: index === currentIndex ? 'auto' : 'none' }}>
              {renderMedia(item, index)}
            </div>
          ))}
        </div>
      )}

      {isCurrentVideo && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {items.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
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

