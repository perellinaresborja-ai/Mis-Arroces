"use client"

import React, { useState } from 'react'
import { Video } from 'lucide-react'

interface VideoThumbnailProps {
  src: string
  alt?: string
  thumbnailPath?: string | null
  className?: string
  fill?: boolean
  width?: number
  height?: number
  showBadge?: boolean
  priority?: boolean
}

const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"

/**
 * Returns the public URL of the pre-generated static thumbnail stored in Supabase.
 * - Primary source: thumbnail_path from media_assets
 * - Fallback for legacy videos: .thumb.webp convention
 */
export function getVideoThumbnailUrl(storagePathOrUrl: string, thumbnailPath?: string | null): string {
  if (!storagePathOrUrl && !thumbnailPath) return ''

  // 1. Explicit thumbnail_path stored in media_assets
  if (thumbnailPath) {
    if (thumbnailPath.startsWith('http')) return thumbnailPath
    return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${thumbnailPath}`
  }

  // 2. Fallback convention for legacy videos without thumbnail_path: .thumb.webp
  const clean = (storagePathOrUrl || '').split('?')[0].split('#')[0]
  if (clean.startsWith('http')) {
    return clean.replace(/\.(mp4|webm|mov)$/i, '.thumb.webp')
  }

  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${clean.replace(/\.(mp4|webm|mov)$/i, '.thumb.webp')}`
}

export function VideoThumbnail({
  src,
  alt = "Miniatura de vídeo",
  thumbnailPath,
  className = "",
  fill = true,
  width,
  height,
  showBadge = false,
  priority = false
}: VideoThumbnailProps) {
  const [hasError, setHasError] = useState(false)
  const thumbUrl = getVideoThumbnailUrl(src, thumbnailPath)

  return (
    <div className={`relative overflow-hidden ${fill ? 'absolute inset-0 w-full h-full' : ''}`}>
      {!hasError && thumbUrl ? (
        <img
          src={thumbUrl}
          alt={alt}
          className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : 'object-cover'} ${className}`}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setHasError(true)}
        />
      ) : (
        /* Safe, elegant static placeholder for legacy videos without a persistent thumbnail */
        <div className={`flex items-center justify-center bg-zinc-900 border border-border/20 ${fill ? 'absolute inset-0 w-full h-full' : ''} ${className}`}>
          <div className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-primary shadow-sm pointer-events-none">
            <Video className="w-5 h-5 fill-current" />
          </div>
        </div>
      )}

      {showBadge && (
        <div className="absolute top-1.5 right-1.5 z-10 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none">
          <Video className="w-3.5 h-3.5 fill-current" />
        </div>
      )}
    </div>
  )
}
