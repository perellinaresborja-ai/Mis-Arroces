"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Volume2, VolumeX, MessageCircle, Share2 } from "lucide-react"
import { PaellaLike } from "@/components/domain/PaellaLike"
import Link from "next/link"
import { toggleLike } from "@/app/actions/interactions"
import { usePathname, useRouter } from "next/navigation"

export function ShortPlayer({ short, currentUserId }: { short: any, currentUserId: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(short.user_liked)
  const [likeCount, setLikeCount] = useState(short.like_count)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const videoPath = short.short_media?.[0]?.media?.storage_path
  const videoUrl = videoPath ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${videoPath}` : null
  const avatarUrl = short.author?.avatar?.storage_path ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${short.author.avatar.storage_path}` : null

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
        } else {
          videoRef.current?.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.6 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1))

    startTransition(async () => {
      try {
        await toggleLike("short" as any, short.id, !newLiked, pathname)
      } catch (err) {
        setIsLiked(!newLiked)
        setLikeCount((prev: number) => !newLiked ? prev + 1 : Math.max(0, prev - 1))
      }
    })
  }

  return (
    <div ref={containerRef} className="h-full w-full snap-start relative bg-black flex items-center justify-center">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          className="h-full w-full object-cover cursor-pointer"
        />
      ) : (
        <div className="text-white/50">Error: No video</div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-gradient-to-b from-black/20 via-transparent to-black/60">
        
        {/* Top Header */}
        <div className="flex justify-end pointer-events-auto">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Content & Side Actions */}
        <div className="flex items-end justify-between w-full pb-16">
          <div className="flex-1 text-white pr-12 pointer-events-auto">
            <Link href={`/@${short.author?.username}`} className="flex items-center gap-2 font-bold mb-2 text-lg hover:underline">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20" />
              )}
              {short.author?.display_name || short.author?.username}
            </Link>
            
            {short.caption && <p className="text-sm mb-3 line-clamp-2">{short.caption}</p>}
            
            {short.recipe_id && (
              <Link href={`/recipes/${short.recipe_id}`} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                Ver Receta 🥘
              </Link>
            )}
            {!short.recipe_id && short.session_id && (
              <Link href={`/sessions/${short.session_id}`} className="inline-flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                Ver Cocinado 👨‍🍳
              </Link>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 pointer-events-auto">
            <button onClick={handleLike} className="flex flex-col items-center gap-1">
              <div className="p-3 bg-black/40 rounded-full backdrop-blur-md">
                <PaellaLike active={isLiked} className="text-2xl" />
              </div>
              <span className="text-xs font-bold">{likeCount}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-black/40 rounded-full backdrop-blur-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold">{short.comment_count}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-black/40 rounded-full backdrop-blur-md">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold">Compartir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
