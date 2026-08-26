import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export const MAX_FILE_SIZE_MB = 100
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_LONG_EDGE = 2560
export const JPEG_QUALITY = 0.85

export type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif' | 'video/mp4' | 'video/webm' | 'video/quicktime'

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  'image/jpeg', 
  'image/png', 
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]

// Super simple client-side image resizer using Canvas
export async function prepareImage(file: File): Promise<File | Blob> {
  // If it's not an image we can process natively (like HEIC), just return it and let Supabase transformations handle it
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let { width, height } = img
      const isLandscape = width > height
      
      if (isLandscape && width > MAX_LONG_EDGE) {
        height = Math.round((height * MAX_LONG_EDGE) / width)
        width = MAX_LONG_EDGE
      } else if (!isLandscape && height > MAX_LONG_EDGE) {
        width = Math.round((width * MAX_LONG_EDGE) / height)
        height = MAX_LONG_EDGE
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(file) // Fallback to original

      ctx.drawImage(img, 0, 0, width, height)

      // Export as WebP for best compression/quality ratio
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Keep original filename but change extension to webp
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            resolve(new File([blob], newName, { type: 'image/webp' }))
          } else {
            resolve(file)
          }
        },
        "image/webp",
        JPEG_QUALITY
      )
    }

    img.onerror = () => reject(new Error("Failed to load image for processing"))
    img.src = url
  })
}

export async function uploadMedia(file: File, context: 'recipes' | 'posts' | 'sessions' | 'avatars' | 'shorts' | 'stories', contextId: string): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(`Formato no soportado: ${file.type}`)
  }
  
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB`)
  }

  const isVideo = file.type.startsWith('video/')
  const processedFile = isVideo ? file : await prepareImage(file)
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("No session")
  
  const ext = processedFile.type.split('/')[1] || 'jpg'
  // Strategy: {user_id}/{context}/{contextId}/{uuid}.{ext}
  const filePath = `${session.user.id}/${context}/${contextId}/${uuidv4()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("recipe_media")
    .upload(filePath, processedFile)

  if (uploadError) {
    console.error("Storage upload error", uploadError)
    throw uploadError
  }

  // Register in media_assets
  const { data: mediaAsset, error: dbError } = await supabase.from("media_assets").insert({
    owner_id: session.user.id,
    storage_path: filePath,
    media_type: isVideo ? 'VIDEO' : 'IMAGE',
    mime_type: processedFile.type,
    // Note: We skip width/height insertion here to keep it simple, or we could extract it from prepareImage
  }).select("id").single()

  if (dbError) {
    console.error("DB insert error", dbError)
    throw dbError
  }

  return mediaAsset.id
}
