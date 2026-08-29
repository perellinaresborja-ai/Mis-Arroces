import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export const MAX_IMAGE_SIZE_MB = 15
export const MAX_FILE_SIZE_MB = 15 // alias for backwards compatibility
export const MAX_VIDEO_SIZE_MB = 100
export const JPEG_QUALITY = 0.80

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

// Determine max long edge based on context to optimize storage and bandwidth
function getMaxLongEdge(context: string): number {
  switch (context) {
    case 'avatars': return 512
    case 'stories': return 1920 // standard vertical 1080x1920
    default: return 2048 // recipes, posts, etc
  }
}

// Super simple client-side image resizer using Canvas
export async function prepareImage(file: File, context: string): Promise<File | Blob> {
  // If it's not an image we can process natively (like HEIC), just return it
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return file
  }

  const maxLongEdge = getMaxLongEdge(context)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let { width, height } = img
      const isLandscape = width > height
      
      if (isLandscape && width > maxLongEdge) {
        height = Math.round((height * maxLongEdge) / width)
        width = maxLongEdge
      } else if (!isLandscape && height > maxLongEdge) {
        width = Math.round((width * maxLongEdge) / height)
        height = maxLongEdge
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

export async function uploadMedia(file: File, context: 'recipes' | 'posts' | 'sessions' | 'avatars' | 'shorts' | 'stories' | 'messages', contextId: string): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(`Formato no soportado: ${file.type}`)
  }
  
  const isVideo = file.type.startsWith('video/')
  const maxBytes = (isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB) * 1024 * 1024

  if (file.size > maxBytes) {
    throw new Error(`El archivo supera el límite de ${isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB}MB`)
  }

  const processedFile = isVideo ? file : await prepareImage(file, context)
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("No session")
  
  const ext = processedFile.type.split('/')[1] || 'jpg'
  // Strategy: {user_id}/{context}/{contextId}/{uuid}.{ext}
  const filePath = `${session.user.id}/${context}/${contextId}/${uuidv4()}.${ext}`

  const bucket = context === 'messages' ? 'message_media' : 'recipe_media'

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, processedFile, {
      cacheControl: '604800',
      upsert: false
    })

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
  }).select("id").single()

  if (dbError) {
    console.error("DB insert error", dbError)
    throw dbError
  }

  return mediaAsset.id
}
