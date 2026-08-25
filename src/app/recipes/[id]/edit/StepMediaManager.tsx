"use client"

import { useState, useRef } from "react"
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB } from "@/services/media/client"
import { Camera, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export type StepMediaItem = {
  type: 'existing'
  id: string // the media_id
  url: string // the full storage url
} | {
  type: 'new'
  file: File
  previewUrl: string
}

interface StepMediaManagerProps {
  initialMedia?: StepMediaItem | null
  onChange: (item: StepMediaItem | null) => void
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export function StepMediaManager({ initialMedia, onChange }: StepMediaManagerProps) {
  const [item, setItem] = useState<StepMediaItem | null>(
    initialMedia || null
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        alert(`Formato no soportado: ${file.name}`)
        return
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande (Max ${MAX_FILE_SIZE_MB}MB)`)
        return
      }
      const previewUrl = URL.createObjectURL(file)
      const newItem: StepMediaItem = { type: 'new', file, previewUrl }
      setItem(newItem)
      onChange(newItem)
    }
  }

  const removeMedia = () => {
    setItem(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2">
      <input 
        type="file" 
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        className="hidden" 
        ref={inputRef}
        onChange={handleFileChange}
      />
      
      {!item ? (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()}
          className="h-24 w-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground"
        >
          <Camera className="w-6 h-6 mb-1 opacity-70" />
          <span className="text-[10px] font-medium">Añadir foto</span>
        </button>
      ) : (
        <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-border group bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={item.type === 'new' ? item.previewUrl : item.url} 
            alt="Paso" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-1 right-1 z-10">
            <button 
              type="button"
              onClick={removeMedia}
              className="bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
