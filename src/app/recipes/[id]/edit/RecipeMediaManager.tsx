"use client"

import { useState, useRef, useEffect } from "react"
import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_MB } from "@/services/media/client"
import { Camera, X, Star, GripVertical } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type MediaItem = {
  type: 'existing'
  id: string // the media_id
  url: string // the full storage url
  isPrimary?: boolean
} | {
  type: 'new'
  id: string // temporary client id
  file: File
  previewUrl: string
  uploadedId?: string // after upload
  isPrimary?: boolean
}

interface RecipeMediaManagerProps {
  initialMedia: any[] // From DB: { media_id, is_primary, display_order, media_assets: { storage_path } }
  onChange: (items: MediaItem[]) => void
}

const SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
const MAX_RECIPE_MEDIA = 10

export function RecipeMediaManager({ initialMedia, onChange }: RecipeMediaManagerProps) {
  // Sort initial items by display_order ONLY (preserving order)
  const initialItems: MediaItem[] = (initialMedia || [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((m) => {
      const storagePath = m.media_assets?.storage_path || m.media?.storage_path
      const id = m.media_id || m.media?.id || m.media_assets?.id || m.id
      return {
        type: 'existing' as const,
        id,
        url: storagePath ? `${SUPABASE_URL}/storage/v1/object/public/recipe_media/${storagePath}` : "",
        isPrimary: Boolean(m.is_primary)
      }
    })
    .filter(m => m.id && m.url && !m.url.endsWith("/undefined"))

  // Ensure at least one photo is primary if items exist
  if (initialItems.length > 0 && !initialItems.some(i => i.isPrimary)) {
    initialItems[0].isPrimary = true
  }

  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const itemsRef = useRef<MediaItem[]>(items)
  itemsRef.current = items

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
  const hasReorderedRef = useRef<boolean>(false)

  // Global safety net: ensure pointer capture and dragging state are always released
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
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

  const notifyChange = (newItems: MediaItem[]) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      const validFiles = newFiles.filter(file => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
          alert(`Formato no soportado: ${file.name}. Usa JPG, PNG o WebP.`)
          return false
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          alert(`El archivo ${file.name} supera el límite de ${MAX_IMAGE_SIZE_MB}MB.`)
          return false
        }
        return true
      })

      const availableSlots = MAX_RECIPE_MEDIA - items.length
      if (availableSlots <= 0) {
        alert(`Ya has alcanzado el límite de ${MAX_RECIPE_MEDIA} fotos para esta receta.`)
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      const filesToAdd = validFiles.slice(0, availableSlots)
      if (validFiles.length > availableSlots) {
        alert(`Solo se han añadido ${availableSlots} fotos para no superar el máximo de ${MAX_RECIPE_MEDIA}.`)
      }

      const newItems: MediaItem[] = filesToAdd.map((file, idx) => ({
        type: 'new',
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
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

    const targetEl = e.currentTarget
    const pointerId = e.pointerId

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    // Touch device: short intentional hold delay (220ms) before activating drag.
    // Leaves normal vertical scroll completely free!
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
      }, 220)
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
        if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
          }
          dragStartPosRef.current = null
          activeDragIdRef.current = null
          return
        }

        // Substantial lateral move after touch:
        if (dist > 16) {
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
        // Desktop mouse: drag activates after 6px movement
        if (dist > 6) {
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
      const nextList = [...currentList]
      const [movedItem] = nextList.splice(currentIdx, 1)
      nextList.splice(targetIdx, 0, movedItem)
      hasReorderedRef.current = true
      itemsRef.current = nextList
      setItems(nextList)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Galería de Fotos ({items.length}/{MAX_RECIPE_MEDIA})
        </span>
        <span className="text-[11px] text-muted-foreground">
          {items.length === 1 ? "1 foto (Portada)" : `${items.length} de ${MAX_RECIPE_MEDIA} fotos`}
        </span>
      </div>

      {items.length > 0 && (
        <div 
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 select-none touch-pan-y"
        >
          {items.map((item, index) => {
            const isCover = Boolean(item.isPrimary)
            const isDraggingThis = activeDragId === item.id
            const imageSrc = item.type === 'existing' ? item.url : item.previewUrl

            return (
              <div 
                key={item.id} 
                data-media-card={item.id}
                data-media-index={index}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border border-border group bg-muted transition-all select-none shadow-sm",
                  isDraggingThis 
                    ? "scale-105 shadow-2xl ring-2 ring-primary z-30 opacity-90 cursor-grabbing touch-none" 
                    : "cursor-grab active:cursor-grabbing hover:border-foreground/30 touch-pan-y",
                  isCover && !isDraggingThis && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                style={{ userSelect: 'none' }}
              >
                <Image 
                  src={imageSrc} 
                  alt={isCover ? "Portada de receta" : `Foto ${index + 1}`} 
                  fill 
                  className="object-cover pointer-events-none" 
                  unoptimized={item.type === 'new'}
                  draggable={false}
                />

                {/* Badge de Portada o Botón para Hacer Portada */}
                {isCover ? (
                  <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Portada</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAsCover(index)
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-2 left-2 z-20 bg-black/65 hover:bg-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm transition-all shadow-sm opacity-90 group-hover:opacity-100 flex items-center gap-1 cursor-pointer"
                    title="Elegir esta foto como portada"
                  >
                    <span>Hacer portada</span>
                  </button>
                )}

                {/* Botón Eliminar */}
                <div className="absolute top-2 right-2 z-20">
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation()
                      removeMedia(index)
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="bg-black/65 text-white p-1.5 rounded-full hover:bg-destructive transition shadow-sm cursor-pointer"
                    title="Eliminar foto"
                    aria-label="Eliminar foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Indicador de orden inferior */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white/90 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <GripVertical className="w-3 h-3 text-white/70" />
                    <span>Foto {index + 1}</span>
                  </div>
                  {items.length > 1 && (
                    <span className="text-[10px] text-white/60 font-medium hidden sm:inline">
                      Arrastrar
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Botón para añadir más fotos */}
          {items.length < MAX_RECIPE_MEDIA && (
            <button 
              type="button" 
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/60 text-muted-foreground hover:text-foreground transition bg-muted/20 hover:bg-muted/40 p-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold">Añadir foto</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {items.length}/{MAX_RECIPE_MEDIA}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Estado vacío cuando no hay ninguna foto */}
      {items.length === 0 && (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/20 hover:bg-muted/30 p-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-foreground">Añadir fotos de la receta</span>
          <span className="text-xs text-muted-foreground mt-1">
            Hasta {MAX_RECIPE_MEDIA} fotos (JPEG, PNG, WebP). Podrás elegir cuál es la portada y arrastrar para ordenarlas.
          </span>
        </button>
      )}

      <p className="text-[12px] text-muted-foreground leading-relaxed">
        Toca <strong>Hacer portada</strong> en cualquier foto para elegirla como imagen principal (recetario, feed, tarjetas). Arrastra las fotos con el ratón o el dedo para ordenar la galería a tu gusto.
      </p>

      <input 
        type="file" 
        ref={inputRef}
        onChange={handleFileChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple
        className="hidden"
      />
    </div>
  )
}
