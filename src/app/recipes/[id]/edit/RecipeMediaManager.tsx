"use client"

import { useState, useRef } from "react"
import { uploadMedia, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, prepareImage } from "@/services/media/client"
import { Camera, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type MediaItem = {
  type: 'existing'
  id: string // the media_id
  url: string // the full storage url
} | {
  type: 'new'
  id: string // temporary
  file: File
  previewUrl: string
  uploadedId?: string // after upload
}

interface RecipeMediaManagerProps {
  initialMedia: any[] // From DB: { media_id, is_primary, media_assets: { storage_path } }
  onChange: (items: MediaItem[]) => void
}

const SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"!

export function RecipeMediaManager({ initialMedia, onChange }: RecipeMediaManagerProps) {
  // Sort initial by display_order, put primary first usually (but display_order should handle that)
  const initialItems: MediaItem[] = (initialMedia || [])
    .sort((a, b) => a.display_order - b.display_order)
    .map(m => ({
      type: 'existing',
      id: m.media_id,
      url: `${SUPABASE_URL}/storage/v1/object/public/recipe_media/${m.media_assets?.storage_path}`
    }))

  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const inputRef = useRef<HTMLInputElement>(null)
  const maxItems = 1

  const notifyChange = (newItems: MediaItem[]) => {
    setItems(newItems)
    onChange(newItems)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      const validFiles = newFiles.filter(file => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
          alert(`Formato no soportado: ${file.name}`)
          return false
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande (Max ${MAX_FILE_SIZE_MB}MB)`)
          return false
        }
        return true
      })

      const availableSlots = maxItems - items.length
      const filesToAdd = validFiles.slice(0, availableSlots)
      
      if (validFiles.length > availableSlots) {
        alert(`Solo puedes subir un máximo de ${maxItems} imágenes.`)
      }

      const newItems: MediaItem[] = filesToAdd.map(file => ({
        type: 'new',
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file)
      }))

      notifyChange([...items, ...newItems])
      
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeMedia = (index: number) => {
    const item = items[index]
    if (item.type === 'new') URL.revokeObjectURL(item.previewUrl)
    
    const updated = [...items]
    updated.splice(index, 1)
    notifyChange(updated)
  }

  const moveItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const updated = [...items]
      const temp = updated[index]
      updated[index] = updated[index - 1]
      updated[index - 1] = temp
      notifyChange(updated)
    } else if (direction === 'right' && index < items.length - 1) {
      const updated = [...items]
      const temp = updated[index]
      updated[index] = updated[index + 1]
      updated[index + 1] = temp
      notifyChange(updated)
    }
  }

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
              <Image 
                src={item.type === 'existing' ? item.url : item.previewUrl} 
                alt="Preview" 
                fill 
                className="object-cover" 
              />
              
              <div className="absolute top-2 right-2 z-10">
                <button 
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {items.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button type="button" onClick={() => moveItem(index, 'left')} disabled={index === 0} className="bg-black/60 disabled:opacity-30 text-white px-2 py-1 rounded text-xs hover:bg-black">
                    &larr;
                  </button>
                  <button type="button" onClick={() => moveItem(index, 'right')} disabled={index === items.length - 1} className="bg-black/60 disabled:opacity-30 text-white px-2 py-1 rounded text-xs hover:bg-black">
                    &rarr;
                  </button>
                </div>
              )}

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

      {items.length === 0 && (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition bg-muted/30"
        >
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Añadir fotos (Máx {maxItems})</span>
        </button>
      )}

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
