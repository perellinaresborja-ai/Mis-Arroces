"use client"

import { useState, useRef, useEffect } from "react"
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/services/media/client"
import { Camera, X, Star, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { optimizePostVideo } from "@/lib/video-optimizer"

export type PostMediaItem = {
  type: 'existing'
  id: string // media_id
  url: string // storage path or public url
  mediaType?: 'IMAGE' | 'VIDEO'
  isPrimary?: boolean
} | {
  type: 'new'
  id: string // local temp id
  file: File
  previewUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
  uploadedId?: string
  isPrimary?: boolean
}

interface PostMediaManagerProps {
  initialMedia?: any[] // from DB: { media_id, is_primary, display_order, media: { id, storage_path, media_type } }
  onChange: (items: PostMediaItem[]) => void
  maxItems?: number
}

const SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"

function VideoThumbnailView({ src }: { src: string }) {
  return (
    <video 
      src={src} 
      className="absolute inset-0 object-cover w-full h-full pointer-events-none" 
      muted 
      playsInline 
      preload="metadata"
    />
  )
}

export function PostMediaManager({
  initialMedia = [],
  onChange,
  maxItems = 10
}: PostMediaManagerProps) {
  // Sort initial items by display_order preserving order
  const initialItems: PostMediaItem[] = (initialMedia || [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((m, idx) => {
      const asset = m.media || m.media_assets || m
      const storagePath = asset?.storage_path || m.storage_path
      const id = m.media_id || asset?.id || m.id || `media-${idx}`
      const isVideo = Boolean(asset?.media_type === 'VIDEO' || storagePath?.match(/\.(mp4|webm|mov)$/i))
      const url = storagePath
        ? (storagePath.startsWith("http") ? storagePath : `${SUPABASE_URL}/storage/v1/object/public/recipe_media/${storagePath}`)
        : ""
      return {
        type: 'existing' as const,
        id,
        url,
        mediaType: (isVideo ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
        isPrimary: Boolean(m.is_primary)
      }
    })
    .filter(m => m.id && m.url && !m.url.endsWith("/undefined"))

  // Ensure at least one is primary if items exist
  if (initialItems.length > 0 && !initialItems.some(i => i.isPrimary)) {
    initialItems[0].isPrimary = true
  }

  const [items, setItems] = useState<PostMediaItem[]>(initialItems)
  const itemsRef = useRef<PostMediaItem[]>(items)
  itemsRef.current = items

  const [isOptimizing, setIsOptimizing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Drag and drop state
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingActiveRef = useRef<boolean>(false)
  const activeDragIdRef = useRef<string | null>(null)
  const pointerTypeRef = useRef<string>('mouse')
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const capturedElementRef = useRef<HTMLElement | null>(null)
  const capturedPointerIdRef = useRef<number | null>(null)
  const draggedNodeRef = useRef<HTMLElement | null>(null)
  const hasReorderedRef = useRef<boolean>(false)

  // Global safety net: ensure pointer capture and dragging state are always released
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }
      if (draggedNodeRef.current) {
        draggedNodeRef.current.style.transform = ''
        draggedNodeRef.current = null
      }
      if (capturedElementRef.current && capturedPointerIdRef.current !== null) {
        try {
          if (capturedElementRef.current.hasPointerCapture(capturedPointerIdRef.current)) {
            capturedElementRef.current.releasePointerCapture(capturedPointerIdRef.current)
          }
        } catch {}
        capturedElementRef.current = null
        capturedPointerIdRef.current = null
      }
      if (isDraggingActiveRef.current || activeDragIdRef.current) {
        const hadReordered = hasReorderedRef.current
        isDraggingActiveRef.current = false
        activeDragIdRef.current = null
        dragStartPosRef.current = null
        hasReorderedRef.current = false
        setActiveDragId(null)
        if (hadReordered) {
          notifyChange(itemsRef.current)
        }
      }
    }

    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointercancel', handleGlobalPointerUp)
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointercancel', handleGlobalPointerUp)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  const notifyChange = (newItems: PostMediaItem[]) => {
    let normalized = [...newItems]
    if (normalized.length > 0) {
      const hasPrimary = normalized.some(item => item.isPrimary)
      if (!hasPrimary) {
        normalized = normalized.map((item, idx) => idx === 0 ? { ...item, isPrimary: true } : item)
      } else {
        let foundFirst = false
        normalized = normalized.map(item => {
          if (item.isPrimary) {
            if (!foundFirst) {
              foundFirst = true
              return item
            }
            return { ...item, isPrimary: false }
          }
          return item
        })
      }
    }
    setItems(normalized)
    itemsRef.current = normalized
    onChange(normalized)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const rawFiles = Array.from(e.target.files)
      
      const validFiles = rawFiles.filter(file => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
          alert(`Formato no soportado: ${file.name}`)
          return false
        }
        const isVideo = file.type.startsWith('video/')
        const maxSize = isVideo ? MAX_VIDEO_SIZE_MB : MAX_FILE_SIZE_MB
        if (file.size > maxSize * 1024 * 1024) {
          alert(`El archivo ${file.name} supera el límite de ${maxSize}MB.`)
          return false
        }
        return true
      })

      const availableSlots = maxItems - items.length
      if (availableSlots <= 0) {
        alert(`Ya has alcanzado el límite de ${maxItems} fotos para esta publicación.`)
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      const filesToAdd = validFiles.slice(0, availableSlots)
      if (validFiles.length > availableSlots) {
        alert(`Solo se han añadido ${availableSlots} fotos para no superar el máximo de ${maxItems}.`)
      }

      const hasVideos = filesToAdd.some(f => f.type.startsWith('video/'))
      if (hasVideos) {
        setIsOptimizing(true)
      }

      const processedFiles: { file: File, isVideo: boolean }[] = []
      for (const file of filesToAdd) {
        if (file.type.startsWith('video/')) {
          try {
            const opt = await optimizePostVideo(file)
            processedFiles.push({ file: opt, isVideo: true })
          } catch {
            processedFiles.push({ file, isVideo: true })
          }
        } else {
          processedFiles.push({ file, isVideo: false })
        }
      }
      setIsOptimizing(false)

      const newItems: PostMediaItem[] = processedFiles.map((p, idx) => ({
        type: 'new',
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file: p.file,
        previewUrl: URL.createObjectURL(p.file),
        mediaType: p.isVideo ? 'VIDEO' : 'IMAGE',
        isPrimary: items.length === 0 && idx === 0
      }))

      notifyChange([...items, ...newItems])
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeMedia = (index: number) => {
    const item = items[index]
    if (item.type === 'new' && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl)
    }
    
    const wasPrimary = Boolean(item.isPrimary)
    const remaining = items.filter((_, idx) => idx !== index)
    if (wasPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isPrimary: true }
    }
    notifyChange(remaining)
  }

  const setAsCover = (targetIndex: number) => {
    const updated = items.map((item, idx) => ({
      ...item,
      isPrimary: idx === targetIndex
    }))
    notifyChange(updated)
  }

  // Pointer drag event handlers for mouse & touch
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    isDraggingActiveRef.current = false
    activeDragIdRef.current = id
    pointerTypeRef.current = e.pointerType
    hasReorderedRef.current = false
    draggedNodeRef.current = e.currentTarget

    const targetEl = e.currentTarget
    const pointerId = e.pointerId

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    // Touch device: short intentional hold delay (200ms) before activating drag.
    // Leaves normal vertical scroll completely uninhibited for swipes!
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      holdTimerRef.current = setTimeout(() => {
        if (dragStartPosRef.current && activeDragIdRef.current === id) {
          isDraggingActiveRef.current = true
          setActiveDragId(id)
          capturedElementRef.current = targetEl
          capturedPointerIdRef.current = pointerId
          try {
            targetEl.setPointerCapture(pointerId)
          } catch {}
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(35) } catch {}
          }
        }
      }, 200)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartPosRef.current || !activeDragIdRef.current) return

    const dx = e.clientX - dragStartPosRef.current.x
    const dy = e.clientY - dragStartPosRef.current.y
    const dist = Math.hypot(dx, dy)

    if (!isDraggingActiveRef.current) {
      if (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') {
        // If moving vertically before hold timer fires, user is scrolling!
        // Immediately cancel drag intent so the browser scrolls smoothly.
        if (Math.abs(dy) > 5 && Math.abs(dy) > Math.abs(dx)) {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
          }
          dragStartPosRef.current = null
          activeDragIdRef.current = null
          draggedNodeRef.current = null
          return
        }

        // Substantial lateral move after touch:
        if (dist > 18) {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
          }
          isDraggingActiveRef.current = true
          setActiveDragId(activeDragIdRef.current)
          capturedElementRef.current = e.currentTarget
          capturedPointerIdRef.current = e.pointerId
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {}
        } else {
          return
        }
      } else {
        // Desktop mouse: drag activates after 5px movement
        if (dist > 5) {
          isDraggingActiveRef.current = true
          setActiveDragId(activeDragIdRef.current)
          capturedElementRef.current = e.currentTarget
          capturedPointerIdRef.current = e.pointerId
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {}
        } else {
          return
        }
      }
    }

    // Direct hardware-accelerated translation on dragged DOM node (zero latency!)
    if (draggedNodeRef.current) {
      draggedNodeRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.06)`
    }

    if (!gridRef.current) return

    const cardElements = Array.from(gridRef.current.querySelectorAll<HTMLElement>('[data-media-card]'))
    if (cardElements.length === 0) return

    const currentList = itemsRef.current
    const currentIdx = currentList.findIndex(item => item.id === activeDragIdRef.current)
    if (currentIdx === -1) return

    let targetIdx = -1
    let minDistance = Infinity

    for (let i = 0; i < cardElements.length; i++) {
      const card = cardElements[i]
      const rect = card.getBoundingClientRect()
      
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        targetIdx = i
        break
      }

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const d = Math.hypot(e.clientX - centerX, e.clientY - centerY)
      if (d < minDistance) {
        minDistance = d
        targetIdx = i
      }
    }

    if (targetIdx !== -1 && targetIdx !== currentIdx && targetIdx < currentList.length) {
      const updated = [...currentList]
      const [movedItem] = updated.splice(currentIdx, 1)
      updated.splice(targetIdx, 0, movedItem)
      hasReorderedRef.current = true
      setItems(updated)
      itemsRef.current = updated
      // Reset drag start position to current position so relative offset smoothly matches new slot
      dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (draggedNodeRef.current) {
      draggedNodeRef.current.style.transform = ''
      draggedNodeRef.current = null
    }

    if (capturedElementRef.current && capturedPointerIdRef.current !== null) {
      try {
        if (capturedElementRef.current.hasPointerCapture(capturedPointerIdRef.current)) {
          capturedElementRef.current.releasePointerCapture(capturedPointerIdRef.current)
        }
      } catch {}
      capturedElementRef.current = null
      capturedPointerIdRef.current = null
    }

    const wasDragging = isDraggingActiveRef.current
    const hadReordered = hasReorderedRef.current

    dragStartPosRef.current = null
    isDraggingActiveRef.current = false
    activeDragIdRef.current = null
    hasReorderedRef.current = false
    setActiveDragId(null)

    if (wasDragging && hadReordered) {
      notifyChange(itemsRef.current)
    }
  }

  return (
    <div className="space-y-4">
      {isOptimizing && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-2xl text-xs font-semibold animate-pulse border border-primary/20">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Optimizando vídeo para reproducción universal (móvil y PC)...</span>
        </div>
      )}

      {items.length > 0 && (
        <div 
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 select-none touch-pan-y"
        >
          {items.map((item, index) => {
            const isDraggingThis = activeDragId === item.id
            const isCover = Boolean(item.isPrimary)
            const src = item.type === 'new' ? item.previewUrl : item.url
            const isVideo = item.mediaType === 'VIDEO'

            return (
              <div
                key={item.id}
                data-media-card
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted group select-none shadow-sm",
                  isDraggingThis 
                    ? "shadow-2xl ring-2 ring-primary z-50 opacity-95 cursor-grabbing touch-none !transition-none" 
                    : "hover:shadow-md cursor-grab active:cursor-grabbing touch-pan-y transition-transform duration-150",
                  isCover && "ring-2 ring-primary/80"
                )}
              >
                {/* Media element */}
                {isVideo ? (
                  <VideoThumbnailView src={src} />
                ) : (
                  <Image 
                    src={src} 
                    alt={`Foto ${index + 1}`} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover pointer-events-none" 
                  />
                )}

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Delete button (Top Right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeMedia(index)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center transition-colors z-20 cursor-pointer shadow-sm"
                  title="Eliminar foto"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Cover badge / button (Bottom) */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-auto">
                  {isCover ? (
                    <span className="bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Portada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAsCover(index)
                      }}
                      className="bg-black/60 hover:bg-black text-white text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Marcar como foto de portada"
                    >
                      <Star className="w-3 h-3" />
                      Hacer portada
                    </button>
                  )}
                  <span className="text-[11px] text-white/80 font-bold bg-black/40 px-1.5 py-0.5 rounded-md">
                    {index + 1}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Add more button */}
          {items.length < maxItems && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/20 hover:bg-muted/40 p-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Añadir más</span>
              <span className="text-[10px] text-muted-foreground">{items.length}/{maxItems}</span>
            </button>
          )}
        </div>
      )}

      {items.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/20 hover:bg-muted/40 p-4 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">Añadir fotos o vídeos (Hasta {maxItems})</span>
          <span className="text-xs text-muted-foreground mt-0.5">Puedes reordenar arrastrando y elegir portada</span>
        </button>
      )}

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple={maxItems > 1}
        className="hidden"
      />
    </div>
  )
}
