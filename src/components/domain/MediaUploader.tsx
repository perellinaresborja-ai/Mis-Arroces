"use client"

import { useState, useCallback, useRef } from "react"
import { uploadMedia, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/services/media/client"
import { Camera, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { optimizePostVideo } from "@/lib/video-optimizer"

export interface SelectedMedia {
  id: string // local temp id
  file: File
  previewUrl: string
}

interface MediaUploaderProps {
  maxItems?: number
  context: 'recipes' | 'posts' | 'sessions' | 'avatars'
  onMediaChange: (media: SelectedMedia[]) => void
  className?: string
  emptyLabel?: string
  variant?: 'default' | 'text'
  hidePreview?: boolean
}

function VideoPreview({ src }: { src: string, fileType?: string }) {
  return (
    <video 
      src={src} 
      className="absolute inset-0 object-cover w-full h-full" 
      autoPlay 
      muted 
      loop 
      playsInline 
      preload="auto"
    />
  );
}

export function MediaUploader({ maxItems = 1, context, onMediaChange, className, emptyLabel, variant = 'default', hidePreview = false }: MediaUploaderProps) {
  const [items, setItems] = useState<SelectedMedia[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
          alert(`El archivo ${file.name} es demasiado grande (Max ${maxSize}MB)`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      // If any video is present, optimize it to universal H.264
      const hasVideos = validFiles.some(f => f.type.startsWith('video/'))
      if (hasVideos) {
        setIsOptimizing(true)
      }

      const processedFiles: File[] = []
      for (const file of validFiles) {
        if (file.type.startsWith('video/')) {
          try {
            const opt = await optimizePostVideo(file)
            processedFiles.push(opt)
          } catch {
            processedFiles.push(file)
          }
        } else {
          processedFiles.push(file)
        }
      }
      setIsOptimizing(false)

      if (maxItems === 1) {
        if (processedFiles.length > 0) {
          const file = processedFiles[0]
          if (items.length > 0) URL.revokeObjectURL(items[0].previewUrl)
          
          const newItems = [{
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file)
          }]
          
          setItems(newItems)
          onMediaChange(newItems)
        }
      } else {
        const availableSlots = maxItems - items.length
        const filesToAdd = processedFiles.slice(0, availableSlots)
        
        if (processedFiles.length > availableSlots) {
          alert(`Solo puedes subir un máximo de ${maxItems} elementos.`)
        }

        const newItems = filesToAdd.map(file => ({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file)
        }))

        const updated = [...items, ...newItems]
        setItems(updated)
        onMediaChange(updated)
      }
      
      // Reset input
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeMedia = (idToRemove: string) => {
    const updated = items.filter(item => item.id !== idToRemove)
    // Revoke URL to prevent memory leaks
    const removedItem = items.find(item => item.id === idToRemove)
    if (removedItem) URL.revokeObjectURL(removedItem.previewUrl)
    
    setItems(updated)
    onMediaChange(updated)
  }

  const moveItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const updated = [...items]
      const temp = updated[index]
      updated[index] = updated[index - 1]
      updated[index - 1] = temp
      setItems(updated)
      onMediaChange(updated)
    } else if (direction === 'right' && index < items.length - 1) {
      const updated = [...items]
      const temp = updated[index]
      updated[index] = updated[index + 1]
      updated[index + 1] = temp
      setItems(updated)
      onMediaChange(updated)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {isOptimizing && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-2xl text-xs font-semibold animate-pulse border border-primary/20">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Optimizando vídeo para reproducción universal (móvil y PC)...</span>
        </div>
      )}

      {items.length > 0 && !hidePreview && (
        <div className={cn("gap-3", maxItems === 1 ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3")}>
          {items.map((item, index) => (
            <div key={item.id} className={cn("relative aspect-square overflow-hidden border border-border group bg-muted", context === 'avatars' ? "rounded-full" : "rounded-xl")}>
              {item.file.type.startsWith('video/') ? (
                <VideoPreview src={item.previewUrl} fileType={item.file.type} />
              ) : (
                <Image src={item.previewUrl} alt="Preview" fill className="object-cover" />
              )}
              
              <div className={cn("absolute z-10 flex gap-1", context === 'avatars' ? "inset-0 items-center justify-center bg-black/20" : "top-2 right-2")}>
                <button 
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="bg-black/60 text-white p-2 rounded-full hover:bg-black transition shadow-sm"
                  title="Quitar foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Controls (Only if multiple items allowed) */}
              {maxItems > 1 && items.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button type="button" onClick={() => moveItem(index, 'left')} disabled={index === 0} className="bg-black/60 disabled:opacity-30 text-white px-2 py-1 rounded text-xs">
                    &larr;
                  </button>
                  <button type="button" onClick={() => moveItem(index, 'right')} disabled={index === items.length - 1} className="bg-black/60 disabled:opacity-30 text-white px-2 py-1 rounded text-xs">
                    &rarr;
                  </button>
                </div>
              )}

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
                  Portada
                </div>
              )}
            </div>
          ))}
          
          {items.length < maxItems && (
            <button 
              type="button" 
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/30"
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Añadir más</span>
            </button>
          )}
        </div>
      )}

      {(items.length === 0 || hidePreview) && variant === 'default' && (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/30"
        >
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">{emptyLabel || `Añadir fotos (Máx ${maxItems})`}</span>
        </button>
      )}

      {(items.length === 0 || hidePreview) && variant === 'text' && (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()}
          className="text-sm font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
        >
          {emptyLabel || `Añadir fotos`}
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
