"use client"

import Image from "next/image"
import { useState } from "react"
import { Utensils, User } from "lucide-react"

interface MediaImageProps {
  src: string | null
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  variant?: 'avatar' | 'feed' | 'detail' | 'story' | 'highlight'
  fallbackType?: 'avatar' | 'recipe' | 'none'
  isPrivate?: boolean
  unoptimized?: boolean
}

export function MediaImage({
  src,
  alt,
  className = "",
  fill = true,
  width,
  height,
  sizes,
  priority = false,
  variant = 'feed',
  fallbackType = 'none',
  isPrivate = false,
  unoptimized = false
}: MediaImageProps) {
  const [error, setError] = useState(false)

  // Determine optimal sizes if not provided
  let defaultSizes = sizes
  if (!defaultSizes && fill) {
    switch (variant) {
      case 'avatar': defaultSizes = "(max-width: 768px) 48px, 64px"; break
      case 'feed': defaultSizes = "(max-width: 768px) 100vw, 640px"; break
      case 'detail': defaultSizes = "(max-width: 1200px) 100vw, 1200px"; break
      case 'story': defaultSizes = "(max-width: 768px) 100vw, 1080px"; break
      case 'highlight': defaultSizes = "(max-width: 768px) 80px, 128px"; break
      default: defaultSizes = "100vw"
    }
  }

  // Handle fallback UI
  if (!src || error) {
    if (fallbackType === 'avatar') {
      return (
        <div className={`flex items-center justify-center bg-primary/10 text-primary/50 ${className}`}>
          <User className="w-1/2 h-1/2" />
        </div>
      )
    }
    if (fallbackType === 'recipe') {
      return (
        <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
          <Utensils className="w-8 h-8 opacity-20" />
        </div>
      )
    }
    return <div className={`bg-muted ${className}`} />
  }

  // Next.js Image Optimization
  // If private (signed URL), we can bypass optimization to avoid cache explosion,
  // or rely on default behavior. Since Signed URLs change every hour, optimizing them
  // fills the Next.js cache. We set unoptimized = true for private to be safe, unless Next.js 14 handles it.
  const shouldUnoptimize = unoptimized || isPrivate;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={defaultSizes}
        priority={priority}
        className={className}
        unoptimized={shouldUnoptimize}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={defaultSizes}
      priority={priority}
      className={className}
      unoptimized={shouldUnoptimize}
      onError={() => setError(true)}
    />
  )
}
