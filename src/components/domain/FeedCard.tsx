"use client"

import { useState } from "react"
import Link from "next/link"
import { ShareButton } from "@/components/domain/ShareButton"
import { ReactionButton } from "@/components/domain/ReactionButton"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { MediaImage } from "@/components/domain/MediaImage"
import { RecipeFeedPlaceholder } from "@/components/domain/RecipeFeedPlaceholder"
import { MessageCircle, Bookmark, MapPin, Users, Tag, ChefHat } from "lucide-react"
import { FeedCommentsInline } from "@/components/domain/FeedCommentsInline"
import { PostOptionsMenu } from "@/components/domain/PostOptionsMenu"
import { cn, formatRelativeTime } from "@/lib/utils"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { FeedFollowButton } from "@/components/domain/FeedFollowButton"
import { SocialTextRenderer } from "@/components/domain/SocialTextRenderer"

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
  reactions?: { emoji: string; user_id: string }[]
  initialGroupedReactions?: Record<string, number>
  initialMyReaction?: string | null
  commentCount: number
  currentUserId: string | null
  followStatus?: string | null

  // Post specific
  postContent?: string
  location?: string | null
  collaborator?: { id: string; username: string; display_name: string | null } | null
  taggedUsers?: { id: string; username: string; display_name: string | null }[]
  
  // Recipe specific
  recipeName?: string
  recipeType?: string
  
  // Session specific
  sessionRating?: number
  sessionSocarrat?: number
  linkedRecipe?: { id: string, name: string }
  isPinned?: boolean

  // Media
  media: { id: string, storage_path: string, media_type?: string, thumbnail_path?: string | null }[]
  priority?: boolean
}

export function FeedCard({
  entityType,
  entityId,
  user: initialUser,
  createdAt,
  reactions,
  initialGroupedReactions,
  initialMyReaction,
  commentCount,
  currentUserId,
  followStatus,
  postContent,
  location,
  collaborator,
  taggedUsers,
  recipeName,
  recipeType,
  sessionRating,
  sessionSocarrat,
  linkedRecipe,
  isPinned,
  media,
  priority = false
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
            <Link href={`/@${user.username}`} className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 block relative">
              {avatar && (
                <MediaImage 
                  src={avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover" 
                  fill={true} 
                  variant="avatar" 
                  fallbackType="avatar"
                />
              )}
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-1">
                <Link href={`/@${user.username}`} className="font-bold text-[15px] hover:underline">
                  {user.display_name || `@${user.username}`}
                </Link>
                {collaborator && (
                  <>
                    <span className="text-xs text-muted-foreground font-normal">y</span>
                    <Link href={`/@${collaborator.username}`} className="font-bold text-[15px] text-primary hover:underline">
                      {collaborator.display_name || `@${collaborator.username}`}
                    </Link>
                  </>
                )}
              </div>
              <div className="text-[13px] text-muted-foreground flex items-center flex-wrap gap-1">
                <Link href={`/@${user.username}`} className="hover:underline">@{user.username}</Link>
                <span>·</span>
                <span>{formatRelativeTime(createdAt)}</span>
                {location && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5 text-foreground/80 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
        </div>
        
        <div className="shrink-0 ml-2">
          {currentUserId !== user.id ? (
          <FeedFollowButton 
            isAuthenticated={!!currentUserId} 
            initialStatus={followStatus || null} 
            targetId={user.id} 
            isPrivate={user.privacy_level === "PRIVATE"} 
            entityType={entityType}
            entityId={entityId}
            postSnapshot={{
              entityType,
              entityId,
              userId: user.id,
              username: user.username,
              postContent: postContent || recipeName || undefined,
              createdAt
            }}
          />
        ) : (
          <PostOptionsMenu 
            entityType={entityType} 
            entityId={entityId} 
            allowComments={true} 
            isPinned={isPinned} 
            hidePin={true}
          />
        )}
        </div>
      </header>

      {/* Tagged People Badge */}
      {taggedUsers && taggedUsers.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground bg-muted/40 border border-border/50 px-3 py-1.5 rounded-xl w-fit">
          <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Con</span>
          {taggedUsers.map((tu, idx) => (
            <span key={tu.id}>
              <Link href={`/@${tu.username}`} className="font-semibold text-foreground hover:underline">
                @{tu.username}
              </Link>
              {idx < taggedUsers.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}

      {/* Context Badge (Sessions) */}
      {entityType === 'session' && linkedRecipe?.id && (
        <div className="text-sm font-medium">
          Ha cocinado <Link href={`/recipes/${linkedRecipe.id}`} className="text-primary hover:underline">{linkedRecipe.name}</Link>
        </div>
      )}

      {/* Text Content (Posts) */}
      {postContent && (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          <SocialTextRenderer text={postContent} />
        </p>
      )}

      {/* Media */}
      {media.length > 0 ? (
        <div className="rounded-2xl overflow-hidden border border-border/50">
          <MediaCarousel items={media} href={href} priority={priority} />
        </div>
      ) : entityType === 'recipe' ? (
        <RecipeFeedPlaceholder href={href} recipeName={recipeName} />
      ) : null}

      {/* Context Badge (Recipes) */}
      {entityType === 'recipe' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <Link href={href} className="font-bold text-lg hover:underline block">{recipeName}</Link>
          {recipeType && <p className="text-sm text-muted-foreground">{recipeType}</p>}
        </div>
      )}

      {/* Linked Recipe (Posts) */}
      {entityType === 'post' && linkedRecipe && (
        <div className="bg-muted/50 border border-border rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Receta vinculada</p>
              <Link href={`/recipes/${linkedRecipe.id}`} className="font-bold hover:underline text-sm truncate block">
                {linkedRecipe.name}
              </Link>
            </div>
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
        <ReactionButton 
          entityType={entityType} 
          entityId={entityId} 
          reactions={reactions}
          initialGroupedReactions={initialGroupedReactions}
          initialMyReaction={initialMyReaction}
          currentUserId={currentUserId}
        />
        
        <button onClick={() => {
            if (!currentUserId) {
              showAuthPrompt("Crea tu cuenta para participar en la conversación.")
              return
            }
            setIsCommentsOpen(!isCommentsOpen)
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

      {/* Inline Comments */}
      <FeedCommentsInline
        isOpen={isCommentsOpen}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        allowComments={true}
      />
    </article>
  )
}
