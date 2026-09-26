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
  
  // Touch / Swipe state para móvil tipo Instagram/Facebook
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const isHorizontalSwipeRef = useRef<boolean | null>(null)
  const hasSwipedRef = useRef(false)

  if (!items || items.length === 0) return null

  const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
  const getMediaUrl = (path: string) => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`

  const next = (e?: React.MouseEvent) => { 
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % items.length) 
  }
  const prev = (e?: React.MouseEvent) => { 
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length) 
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (items.length <= 1) return
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    isHorizontalSwipeRef.current = null
    hasSwipedRef.current = false
    setIsDragging(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || items.length <= 1) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Si aún no hemos determinado si es scroll vertical o swipe horizontal
    if (isHorizontalSwipeRef.current === null) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      // Umbral de 6px para discriminar intención del usuario
      if (absX < 6 && absY < 6) return

      if (absY > absX) {
        // Es scroll vertical: no interferir
        isHorizontalSwipeRef.current = false
        return
      } else {
        // Es swipe horizontal
        isHorizontalSwipeRef.current = true
        setIsDragging(true)
      }
    }

    // Si es swipe horizontal, acompañar con resistencia en extremos
    if (isHorizontalSwipeRef.current) {
      hasSwipedRef.current = true
      let offset = deltaX
      // Resistencia elástica al intentar pasar del primer o último elemento
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === items.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.25
      }
      setDragOffset(offset)
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart || items.length <= 1) return

    if (isHorizontalSwipeRef.current) {
      const threshold = 40 // Umbral en px para confirmar cambio de foto

      // Swipe izquierda (deltaX < -threshold) -> siguiente foto
      if (dragOffset < -threshold && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } 
      // Swipe derecha (deltaX > threshold) -> foto anterior
      else if (dragOffset > threshold && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }

    // Resetear estados con animación elástica de vuelta
    setIsDragging(false)
    setDragOffset(0)
    setTouchStart(null)
    isHorizontalSwipeRef.current = null

    // Retardo breve para evitar que el click posterior en Link se active
    setTimeout(() => {
      hasSwipedRef.current = false
    }, 150)
  }
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

  const trackTransform = isDragging 
    ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` 
    : `translateX(-${currentIndex * 100}%)`

  const trackTransition = isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'

  return (
    <div 
      className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 touch-pan-y select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {href ? (
        <Link 
          href={href} 
          className="absolute inset-0 block overflow-hidden"
          onClick={(e) => {
            if (hasSwipedRef.current) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <div 
            className="flex w-full h-full"
            style={{
              transform: trackTransform,
              transition: trackTransition
            }}
          >
            {items.map((item, index) => (
              <div key={item.id} className="w-full h-full shrink-0 relative">
                {renderMedia(item, index)}
              </div>
            ))}
          </div>
        </Link>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="flex w-full h-full"
            style={{
              transform: trackTransform,
              transition: trackTransition
            }}
          >
            {items.map((item, index) => (
              <div key={item.id} className="w-full h-full shrink-0 relative">
                {renderMedia(item, index)}
              </div>
            ))}
          </div>
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
          {/* Flecha izquierda: Solo visible en PC/escritorio (hidden en móvil/táctil) */}
          <button 
            type="button"
            onClick={prev}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10 items-center justify-center cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Flecha derecha: Solo visible en PC/escritorio (hidden en móvil/táctil) */}
          <button 
            type="button"
            onClick={next}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10 items-center justify-center cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Puntos indicadores: Mantenidos tanto en móvil como en PC */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
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


