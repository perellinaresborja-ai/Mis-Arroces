"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { useState, useEffect } from "react"
import { LikeButton } from "@/components/domain/LikeButton"
import { ShareButton } from "@/components/domain/ShareButton"
import { MessageCircle, X, ChevronLeft, ChevronRight, User } from "lucide-react"
import { PostOptionsMenu } from "./PostOptionsMenu"
import { CommentSection } from "@/components/domain/CommentSection"
import { getComments } from "@/app/actions/interactions"
import Link from "next/link"
import Image from "next/image"

export function SocialElaborationModal({ isOpen, onClose, item, currentUserId }: { isOpen: boolean, onClose: () => void, item: any, currentUserId: string | undefined }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // Prevent background scroll when open and load comments
  useEffect(() => {
    if (isOpen && item) {
      document.body.style.overflow = 'hidden'
      setLoadingComments(true)
      getComments(item.entity_type, item.id, currentUserId || null).then(data => {
        setComments(data)
        setLoadingComments(false)
      })
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, item, currentUserId])

  if (!isOpen || !item) return null

  const handleCommentAdded = (newComment: any) => setComments(prev => [...prev, newComment])
  const handleCommentDeleted = (commentId: string) => setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_deleted: true, content: "Comentario eliminado" } : c))

  const mediaList = item.recipe_media || item.session_media || item.post_media || []
  const media = [...mediaList].sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)).map(m => m.media).filter(Boolean)

  const NEXT_PUBLIC_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
  const getImageUrl = (path: string) => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${path}`

  const next = () => setCurrentIndex(prev => (prev + 1) % media.length)
  const prev = () => setCurrentIndex(prev => (prev - 1 + media.length) % media.length)

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
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
              {authorAvatarUrl ? <MediaImage src={authorAvatarUrl} alt="Avatar" className="w-full h-full object-cover" fill={true} /> : <User className="w-full h-full p-1.5 text-muted-foreground"/>}
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
          {media.length > 0 ? (
            <>
              <Image 
                src={getImageUrl(media[currentIndex].storage_path)} 
                alt={`Media ${currentIndex + 1}`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                className="object-contain"
                priority
              />
              {media.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {media.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
             <div className="text-white/50">Sin foto</div>
          )}
        </div>

        {/* RIGHT: INFO & COMMENTS */}
        <div className="md:w-[45%] lg:w-[40%] flex flex-col flex-1 bg-card min-h-0">
           {/* Desktop Header */}
           <div className="hidden md:flex items-center justify-between p-4 border-b border-border shrink-0">
             <Link href={`/@${item.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                 {authorAvatarUrl ? <MediaImage src={authorAvatarUrl} alt="Avatar" className="w-full h-full object-cover" fill={true} /> : <User className="w-full h-full p-2 text-muted-foreground"/>}
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
               />
             )}
           </div>

           {/* Social Bar (Bottom) */}
           <div className="p-4 border-t border-border shrink-0 flex items-center gap-6 bg-card">
             <LikeButton 
                entityType={item.entity_type}
                entityId={item.id}
                initialIsLiked={item.isLiked}
                initialLikeCount={item.likeCount}
                isAuthenticated={!!currentUserId}
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
