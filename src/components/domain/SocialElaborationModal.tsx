"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { useState, useEffect } from "react"
import { ReactionButton } from "@/components/domain/ReactionButton"
import { ShareButton } from "@/components/domain/ShareButton"
import { MessageCircle, X, User } from "lucide-react"
import { PostOptionsMenu } from "./PostOptionsMenu"
import { CommentSection } from "@/components/domain/CommentSection"
import { getComments } from "@/app/actions/interactions"
import { MediaCarousel, MediaItem } from "@/components/domain/MediaCarousel"
import Link from "next/link"

export function SocialElaborationModal({ isOpen, onClose, item, currentUserId }: { isOpen: boolean, onClose: () => void, item: any, currentUserId: string | undefined }) {
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const PAGE_SIZE = 50

  // Prevent background scroll when open and load comments
  useEffect(() => {
    if (isOpen && item) {
      document.body.style.overflow = 'hidden'
      setLoadingComments(true)
      setOffset(0)
      getComments(item.entity_type, item.id, currentUserId || null, PAGE_SIZE, 0).then(data => {
        setComments(data)
        const rootCount = data.filter((c: any) => !c.parent_id).length
        setHasMore(rootCount >= PAGE_SIZE)
        setOffset(PAGE_SIZE)
        setLoadingComments(false)
      })
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, item, currentUserId])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !item) return
    setLoadingMore(true)
    try {
      const nextBatch = await getComments(item.entity_type, item.id, currentUserId || null, PAGE_SIZE, offset)
      const nextRootCount = nextBatch.filter((c: any) => !c.parent_id).length
      setComments(prev => {
        const existingIds = new Set(prev.map((c: any) => c.id))
        const newUnique = nextBatch.filter((c: any) => !existingIds.has(c.id))
        return [...prev, ...newUnique]
      })
      setOffset(prev => prev + PAGE_SIZE)
      if (nextRootCount < PAGE_SIZE) {
        setHasMore(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMore(false)
    }
  }

  if (!isOpen || !item) return null

  const handleCommentAdded = (newComment: any) => setComments(prev => [...prev, newComment])
  const handleCommentDeleted = (commentId: string) => setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_deleted: true, content: "Comentario eliminado" } : c))

  const rawList = item.recipe_media || item.session_media || item.post_media || item.media || []
  const sorted = Array.isArray(rawList)
    ? [...rawList].sort((a: any, b: any) => (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0) || (a?.display_order || 0) - (b?.display_order || 0))
    : []
  const mediaItems: MediaItem[] = []
  sorted.forEach((m: any, idx: number) => {
    const asset = m?.media || m?.media_assets || m
    if (!asset) return
    if (typeof asset === 'string') {
      mediaItems.push({
        id: `media-${idx}`,
        storage_path: asset,
        media_type: asset.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE',
        thumbnail_path: null
      })
      return
    }
    if (asset.storage_path) {
      mediaItems.push({
        id: String(asset.id || `media-${idx}`),
        storage_path: asset.storage_path,
        media_type: asset.media_type || (asset.storage_path.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'),
        thumbnail_path: asset.thumbnail_path || null
      })
    }
  })

  const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
  const getImageUrl = (path: string) => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${path}`

  const href = item.entity_type === 'recipe' ? `/recipes/${item.id}` : item.entity_type === 'session' ? `/sessions/${item.id}` : `/posts/${item.id}`
  const actionLabel = item.entity_type === 'recipe' ? "Ver receta completa" : item.entity_type === 'session' ? "Ver cocinado" : "Ver post"
  const isOwner = currentUserId && item.author?.id === currentUserId;

  const authorAvatarUrl = item.author?.avatar?.storage_path ? getImageUrl(item.author.avatar.storage_path) : null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-background border border-border shadow-2xl flex flex-col md:flex-row h-[100dvh] sm:h-[90dvh] sm:max-h-[850px] sm:rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card shrink-0">
          <Link href={`/@${item.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8 rounded-full bg-muted overflow-hidden">
              {authorAvatarUrl ? <MediaImage src={authorAvatarUrl} alt="Avatar" className="w-full h-full object-cover" fill={true} variant="avatar" fallbackType="avatar" /> : <User className="w-full h-full p-1.5 text-muted-foreground"/>}
            </div>
            <span className="font-bold text-sm">@{item.author?.username}</span>
          </Link>
          <div className="flex items-center gap-1">
            {isOwner && <PostOptionsMenu entityType={item.entity_type} entityId={item.id} allowComments={item.allow_comments ?? true} onDeleted={onClose} />}
            <button onClick={onClose} className="p-2"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {/* LEFT: MEDIA */}
        <div className="md:w-[55%] lg:w-[60%] bg-black flex items-center justify-center relative shrink-0 h-[40dvh] md:h-full">
          {mediaItems.length > 0 ? (
            <MediaCarousel 
              items={mediaItems} 
              priority={true} 
              className="w-full h-full aspect-auto md:aspect-auto rounded-none bg-black"
              imageFit="contain"
            />
          ) : (
             <div className="text-white/50">Sin foto</div>
          )}
        </div>

        {/* RIGHT: INFO & COMMENTS */}
        <div className="md:w-[45%] lg:w-[40%] flex flex-col flex-1 bg-card min-h-0">
           {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between p-4 border-b border-border shrink-0">
              <Link href={`/@${item.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {authorAvatarUrl ? <MediaImage src={authorAvatarUrl} alt="Avatar" className="w-full h-full object-cover" fill={true} variant="avatar" fallbackType="avatar" /> : <User className="w-full h-full p-2 text-muted-foreground"/>}
                </div>
                <div>
                 <div className="font-bold text-sm leading-tight">{item.author?.display_name || `@${item.author?.username}`}</div>
                 <div className="text-xs text-muted-foreground">@{item.author?.username}</div>
               </div>
             </Link>
             
             <div className="flex items-center gap-3">
               
               {isOwner && <PostOptionsMenu entityType={item.entity_type} entityId={item.id} allowComments={item.allow_comments ?? true} onDeleted={onClose} />}
              <button onClick={onClose} className="hover:bg-muted p-1.5 rounded-full transition"><X className="w-5 h-5"/></button>
             </div>
           </div>

           {/* Scrollable Comments Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
             <div className="bg-muted/30 p-3 rounded-xl border border-border">
               <h2 className="text-base font-bold">{item.name || item.content}</h2>
               <Link href={href} className="text-sm text-primary hover:underline mt-1 inline-block font-medium">
                 {actionLabel} &rarr;
               </Link>
             </div>
             
              {loadingComments ? (
                <div className="text-center text-muted-foreground py-8">Cargando comentarios...</div>
              ) : (
                <CommentSection 
                   entityType={item.entity_type} 
                   entityId={item.id} 
                   currentUserId={currentUserId || null}
                   comments={comments}
                   allowComments={true}
                   onCommentAdded={handleCommentAdded}
                   onCommentDeleted={handleCommentDeleted}
                   hasMore={hasMore}
                   loadingMore={loadingMore}
                   onLoadMore={handleLoadMore}
                />
              )}
           </div>

           {/* Social Bar (Bottom) */}
           <div className="p-4 border-t border-border shrink-0 flex items-center gap-6 bg-card">
             <ReactionButton 
                entityType={item.entity_type}
                entityId={item.id}
                reactions={item.reactions}
                currentUserId={currentUserId || null}
             />
             <div className="flex items-center gap-1.5 text-muted-foreground">
               <MessageCircle className="w-6 h-6" />
               <span className="text-sm font-medium">{item.commentCount}</span>
             </div>
             <ShareButton title={item.name} text="" path={href} />
             <div className="flex-1" />
           </div>
        </div>
      </div>
    </div>
  )
}
