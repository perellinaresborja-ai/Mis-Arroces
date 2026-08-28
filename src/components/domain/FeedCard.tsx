"use client"

import { useState } from "react"
import Link from "next/link"
import { ShareButton } from "@/components/domain/ShareButton"
import { LikeButton } from "@/components/domain/LikeButton"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { MessageCircle, Bookmark } from "lucide-react"
import { CommentsModal } from "@/components/domain/CommentsModal"
import { cn, formatRelativeTime } from "@/lib/utils"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { FeedFollowButton } from "@/components/domain/FeedFollowButton"

export interface FeedCardProps {
  entityType: "recipe" | "session" | "post"
  entityId: string
  user: {
    id: string
    username: string
    display_name: string | null
    privacy_level?: string
    avatar?: { storage_path: string } | null
  }
  createdAt: string
  
  // Counts & State
  likeCount: number
  isLiked: boolean
  commentCount: number
  currentUserId: string | null
  followStatus?: string | null

  // Post specific
  postContent?: string
  
  // Recipe specific
  recipeName?: string
  recipeType?: string
  
  // Session specific
  sessionRating?: number
  sessionSocarrat?: number
  linkedRecipe?: { id: string, name: string }

  // Media
  media: { id: string, storage_path: string }[]
}

export function FeedCard({
  entityType,
  entityId,
  user: initialUser,
  createdAt,
  likeCount,
  isLiked,
  commentCount,
  currentUserId,
  followStatus,
  postContent,
  recipeName,
  recipeType,
  sessionRating,
  sessionSocarrat,
  linkedRecipe,
  media
}: FeedCardProps) {

  const user = initialUser || { username: 'usuario_desconocido', display_name: 'Usuario Desconocido', avatar: null };
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const { showAuthPrompt } = useAuthPrompt()
  
  const avatar = user.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${user.avatar?.storage_path}`
    : null

  const href = entityType === 'recipe' 
    ? `/recipes/${entityId}` 
    : entityType === 'session'
    ? `/sessions/${entityId}`
    : `/posts/${entityId}`

  return (
    <article className="bg-card md:rounded-3xl border-y md:border border-border p-4 sm:p-5 space-y-4 shadow-sm max-w-2xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/@${user.username}`} className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 block">
            {avatar && <img src={avatar} alt={user.username} className="w-full h-full object-cover" />}
          </Link>
          <div>
            <div className="flex items-center">
              <Link href={`/@${user.username}`} className="font-bold text-[15px] hover:underline">
                {user.display_name || `@${user.username}`}
              </Link>
            </div>
            {user.display_name && (
              <div className="text-[13px] text-muted-foreground flex items-center gap-1">
                <Link href={`/@${user.username}`} className="hover:underline">@{user.username}</Link> <span>·</span> {formatRelativeTime(createdAt)}
              </div>
            )}
          </div>
        </div>
        
        <div className="shrink-0 ml-2">
          {currentUserId !== user.id && (
            <FeedFollowButton 
              isAuthenticated={!!currentUserId} 
              initialStatus={followStatus || null} 
              targetId={user.id} 
              isPrivate={user.privacy_level === 'PRIVATE'} 
            />
          )}
        </div>
      </header>

      {/* Context Badge (Sessions) */}
      {entityType === 'session' && (
        <div className="text-sm font-medium">
          Ha cocinado <Link href={`/recipes/${linkedRecipe?.id}`} className="text-primary hover:underline">{linkedRecipe?.name}</Link>
        </div>
      )}

      {/* Text Content (Posts) */}
      {postContent && (
        <p className="whitespace-pre-wrap text-[15px]">{postContent}</p>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-border/50">
          <MediaCarousel items={media} />
        </div>
      )}

      {/* Context Badge (Recipes) */}
      {entityType === 'recipe' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <Link href={href} className="font-bold text-lg hover:underline block">{recipeName}</Link>
          {recipeType && <p className="text-sm text-muted-foreground">{recipeType}</p>}
        </div>
      )}

      {/* Linked Recipe (Posts) */}
      {entityType === 'post' && linkedRecipe && (
        <div className="bg-muted border border-border rounded-xl p-3 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Receta vinculada</p>
            <Link href={`/recipes/${linkedRecipe.id}`} className="font-medium hover:underline text-sm">{linkedRecipe.name}</Link>
          </div>
        </div>
      )}

      {/* Session Details */}
      {entityType === 'session' && (sessionRating || sessionSocarrat) && (
        <div className="flex gap-4">
          {sessionRating && <div className="text-sm">Valoración: <strong>{"⭐".repeat(sessionRating)}</strong></div>}
          {sessionSocarrat && <div className="text-sm">Socarrat: <strong>Nivel {sessionSocarrat}</strong></div>}
        </div>
      )}

      {/* Actions */}
      <footer className="flex items-center gap-6 pt-2 border-t border-border/50 text-muted-foreground">
        <LikeButton 
          entityType={entityType} 
          entityId={entityId} 
          initialIsLiked={isLiked} 
          initialLikeCount={likeCount} 
          isAuthenticated={!!currentUserId}
        />
        
        <button onClick={() => {
            if (!currentUserId) {
              showAuthPrompt("Crea tu cuenta para participar en la conversación.")
              return
            }
            setIsCommentsOpen(true)
          }} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <MessageCircle className="w-6 h-6 transition-colors hover:text-primary" />
          {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
        </button>
        
        <ShareButton 
          title={entityType === 'recipe' ? (recipeName || "") : `Publicación de ${user.display_name || `@${user.username}`}`} 
          text=""
          path={`/p/${entityType}/${entityId}`} 
        />
        <div className="flex-1" />
      </footer>

      {/* Inline Comments Modal */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        isOwner={currentUserId === user.id}
        allowComments={true} // Feed components usually allow comments, or we could fetch it.
      />
    </article>
  )
}


