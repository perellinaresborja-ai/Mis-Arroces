import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { registerMediaAsset } from "@/app/actions/media"

export const MAX_IMAGE_SIZE_MB = 15
export const MAX_FILE_SIZE_MB = 15 // alias for backwards compatibility
export const MAX_VIDEO_SIZE_MB = 50
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
    case 'messages': return 2048
    default: return 2048 // recipes, posts, etc
  }
}

// Client-side image optimizer using Canvas to produce WebP
export async function prepareImage(file: File, context: string): Promise<File> {
  // If it's a video, do not process as image
  if (file.type.startsWith('video/')) {
    return file
  }

  const maxLongEdge = getMaxLongEdge(context)

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let { width, height } = img
      if (!width || !height) {
        return resolve(file)
      }

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
            // Keep original filename base but change extension to .webp
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

    img.onerror = () => {
      URL.revokeObjectURL(url)
      console.warn("prepareImage: no se pudo decodificar la imagen nativamente, fallback controlado a original:", file.name, file.type)
      // Fallback seguro: no romper la subida del usuario si el navegador no tiene el decodificador
      resolve(file)
    }

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
  
  const ext = processedFile.type === 'image/webp' ? 'webp' : (processedFile.name.split('.').pop() || processedFile.type.split('/')[1] || 'jpg')
  // Strategy: {user_id}/{context}/{contextId}/{uuid}.{ext}
  const filePath = `${session.user.id}/${context}/${contextId}/${uuidv4()}.${ext}`

  const bucket = context === 'messages' ? 'message_media' : 'recipe_media'

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, processedFile, {
      cacheControl: '604800',
      upsert: false,
      contentType: processedFile.type
    })

  if (uploadError) {
    console.error("Storage upload error", uploadError)
    if (uploadError.message?.includes("exceeded the maximum allowed size") || uploadError.message?.includes("EntityTooLarge") || (uploadError as any).statusCode === '413') {
      throw new Error(`El servidor rechazó el archivo por superar el límite (Max ${isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB}MB).`)
    }
    throw uploadError
  }

  // Generate and upload lightweight static thumbnail if video
  let thumbnailPath: string | undefined = undefined
  if (isVideo) {
    try {
      const { generateVideoThumbnailFile } = await import("@/lib/video-optimizer")
      const thumbFile = await generateVideoThumbnailFile(processedFile, file.name)
      thumbnailPath = filePath.replace(/\.[^/.]+$/, "") + ".thumb.webp"
      await supabase.storage
        .from(bucket)
        .upload(thumbnailPath, thumbFile, {
          cacheControl: '31536000',
          upsert: true
        })
    } catch (thumbErr) {
      console.warn("Could not generate or upload video thumbnail at upload time:", thumbErr)
      thumbnailPath = undefined
    }
  }

  // Register in media_assets via Server Action for strict server-side size validation
  const assetId = await registerMediaAsset(filePath, processedFile.type, bucket, thumbnailPath)

  return assetId
}
