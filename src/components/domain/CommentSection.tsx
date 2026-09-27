"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import React, { useState, useTransition, useRef, useEffect, useMemo } from "react"
import { createComment, deleteComment, editComment, toggleCommentReaction } from "@/app/actions/interactions"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Reply, ArrowUp, SmilePlus, Image as ImageIcon, Sparkles, X, Clock, Flame, Loader2 } from "lucide-react"
import { useAutocomplete } from "@/hooks/useAutocomplete"
import { AutocompleteMenu } from "./AutocompleteMenu"
import { SocialTextRenderer } from "./SocialTextRenderer"
import Link from "next/link"
import { cn, formatRelativeTime } from "@/lib/utils"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { ReportButton } from "./ReportButton"
import { ExpandableImage } from "@/components/ui/ExpandableImage"
import { CommentGifPicker, GifItem } from "./CommentGifPicker"
import { createClient } from "@/lib/supabase/client"

export interface Comment {
  id: string
  content: string
  is_deleted: boolean
  created_at: string
  parent_id: string | null
  media_type?: "IMAGE" | "GIF" | null
  media_url?: string | null
  media_metadata?: any
  reactions?: { emoji: string; user_id: string }[]
  author: {
    id: string
    username: string
    display_name: string | null
    avatar: { storage_path: string } | null
  }
}

interface CommentSectionProps {
  entityType: "recipe" | "session" | "post"
  entityId: string
  comments: Comment[]
  currentUserId: string | null
  allowComments: boolean
}

type SelectedMedia = 
  | { type: "IMAGE"; file: File; previewUrl: string }
  | { type: "GIF"; url: string; metadata: any }
  | null

function CommentReactionUI({ comment, entityType, currentUserId }: { comment: Comment, entityType: string, currentUserId: string | null }) {
  const { showAuthPrompt } = useAuthPrompt()
  const [isPending, startTransition] = useTransition()
  const [optimisticReactions, setOptimisticReactions] = useState<any[]>(
    Array.isArray(comment.reactions) ? comment.reactions : []
  )
  const [showReactionMenu, setShowReactionMenu] = useState(false)
  const [showReactionAnim, setShowReactionAnim] = useState(false)
  
  const handleReact = (emoji: string) => {
    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para reaccionar.")
      return
    }
    if (emoji === '🥘') {
      setShowReactionAnim(true)
      setTimeout(() => setShowReactionAnim(false), 800)
    }
    setShowReactionMenu(false)
    
    setOptimisticReactions(prev => {
      const existingIdx = prev.findIndex(r => r.user_id === currentUserId)
      if (existingIdx !== -1) {
        if (prev[existingIdx].emoji === emoji) {
          return prev.filter(r => r.user_id !== currentUserId)
        } else {
          const newArr = [...prev]
          newArr[existingIdx] = { ...newArr[existingIdx], emoji }
          return newArr
        }
      } else {
        return [...prev, { id: 'temp_' + Date.now(), comment_id: comment.id, user_id: currentUserId, emoji }]
      }
    })
    
    startTransition(() => {
      toggleCommentReaction(entityType as any, comment.id, emoji)
    })
  }

  const groupReactions = () => {
    const counts: Record<string, { count: number, hasMine: boolean }> = {}
    optimisticReactions.forEach(r => {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, hasMine: false }
      counts[r.emoji].count += 1
      if (r.user_id === currentUserId) counts[r.emoji].hasMine = true
    })
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count)
  }

  return (
    <div className="relative group w-full mt-1">
      <button id={`reaction-trigger-${comment.id}`} className="hidden" onClick={() => setShowReactionMenu(!showReactionMenu)} />
      <div 
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setShowReactionMenu(false); }}
        onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReactionMenu(true); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setShowReactionMenu(true); }}
      />
      {showReactionAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-bounce">
          <span className="text-5xl drop-shadow-lg scale-110">🥘</span>
        </div>
      )}
      
      {showReactionMenu && (
        <div className="absolute top-0 left-0 bg-card border border-border shadow-xl rounded-full px-3 py-2 flex items-center gap-3 z-50 animate-in fade-in zoom-in-95 duration-200">
          {['🥘', '😂', '🔥', '👍', '😲'].map(em => (
            <button key={em} onClick={(e) => { e.stopPropagation(); handleReact(em); }} className="text-2xl hover:scale-125 transition-transform active:scale-95">
              {em}
            </button>
          ))}
        </div>
      )}

      {optimisticReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 justify-start relative z-10">
          {groupReactions().map(([emoji, data]) => (
            <button 
              key={emoji} 
              onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shadow-sm transition-transform active:scale-95 ${data.hasMine ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
            >
              <span>{emoji}</span>
              <span className="font-semibold">{data.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentThread({ comment, replies, entityType, currentUserId, allowComments, onReply, onDelete }: {
  comment: Comment
  replies: Comment[]
  entityType: string
  currentUserId: string | null
  allowComments: boolean
  onReply: (id: string, username: string) => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content || "")
  const [localContent, setLocalContent] = useState(comment.content || "")
  const [localMediaUrl, setLocalMediaUrl] = useState(comment.media_url)
  const [localMediaType, setLocalMediaType] = useState(comment.media_type)
  const [removeMedia, setRemoveMedia] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showReplies, setShowReplies] = useState(false)

  const isOwn = Boolean(
    currentUserId && (
      (comment.author?.id && currentUserId === comment.author.id) ||
      ((comment as any).author_id && currentUserId === (comment as any).author_id)
    )
  )
  const getAvatar = (path?: string) => path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${path}` : null
  const avatar = getAvatar(comment.author?.avatar?.storage_path)

  const handleEdit = () => {
    if (editContent.trim() === localContent && !removeMedia) {
      setIsEditing(false)
      return
    }
    startTransition(async () => {
      try {
        await editComment(entityType as any, comment.id, editContent, removeMedia)
        setLocalContent(editContent.trim())
        if (removeMedia) {
          setLocalMediaUrl(null)
          setLocalMediaType(null)
        }
        setIsEditing(false)
      } catch(e) {
        setEditContent(localContent)
        setRemoveMedia(false)
      }
    })
  }

  return (
    <div className="flex gap-3 relative">
      <Link href={"/@" + comment.author.username} className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden block mt-1 relative">
        {avatar && <MediaImage src={avatar} alt={comment.author.username} className="w-full h-full object-cover" fill={true} variant="avatar" fallbackType="avatar" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl p-3 w-full relative">
          <div className="flex items-center gap-1.5 mb-1 relative z-10">
            <Link href={"/@" + comment.author.username} className="font-bold text-sm hover:underline">{comment.author.display_name || comment.author.username}</Link>
            <span className="text-xs text-muted-foreground font-normal">· {formatRelativeTime(comment.created_at)}</span>
          </div>
          
          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2 relative z-10">
              <textarea 
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full text-sm bg-background border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                autoFocus
              />
              
              {localMediaUrl && !removeMedia && (
                <div className="relative inline-block self-start my-1">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border shadow-xs bg-muted">
                    <img src={localMediaUrl} alt="Adjunto" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setRemoveMedia(true)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background border border-border text-destructive shadow-xs transition-colors"
                      title="Eliminar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setRemoveMedia(false); }} disabled={isPending}>Cancelar</Button>
                <Button size="sm" onClick={handleEdit} disabled={isPending || (!editContent.trim() && (removeMedia || !localMediaUrl))}>Guardar</Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {localContent && (
                <p className={cn("text-sm whitespace-pre-wrap relative z-10", comment.is_deleted && "text-muted-foreground italic")}>
                  <SocialTextRenderer text={localContent} />
                </p>
              )}

              {!comment.is_deleted && localMediaUrl && (
                <div className="mt-2.5 max-w-[280px] rounded-2xl overflow-hidden border border-border/70 bg-card shadow-xs relative z-10">
                  {localMediaType === 'IMAGE' ? (
                    <ExpandableImage
                      src={localMediaUrl}
                      alt="Foto en comentario"
                      className="w-full max-h-[220px] object-cover rounded-2xl block"
                    />
                  ) : (
                    <img
                      src={localMediaUrl}
                      alt="GIF"
                      className="w-full max-h-[200px] object-cover rounded-2xl block"
                      loading="lazy"
                    />
                  )}
                </div>
              )}

              {!comment.is_deleted && <CommentReactionUI comment={comment} entityType={entityType} currentUserId={currentUserId} />}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium relative z-10">
          <button onClick={() => document.getElementById(`reaction-trigger-${comment.id}`)?.click()} className="hover:text-foreground flex items-center gap-1" title="Reaccionar"><SmilePlus className="w-3.5 h-3.5"/></button>
          {allowComments && !comment.is_deleted && (
            <button onClick={() => onReply(comment.id, comment.author.username)} className="hover:text-foreground">Responder</button>
          )}
          {isOwn && !comment.is_deleted && (
            <>
              <button onClick={() => setIsEditing(true)} className="hover:text-foreground" disabled={isPending}>Editar</button>
              <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>Eliminar</button>
            </>
          )}
          {!isOwn && !comment.is_deleted && (
            <ReportButton
              targetType="COMMENT"
              targetId={comment.id}
              reportedUserId={comment.author.id}
              contentSnapshot={{
                commentId: comment.id,
                entityType,
                authorUsername: comment.author.username,
                content: comment.content,
                created_at: comment.created_at
              }}
              title="Reportar comentario"
              variant="icon"
              label="Reportar comentario"
              isAuthenticated={!!currentUserId}
              className="hover:text-destructive p-0"
            />
          )}
        </div>
        
        {replies.length > 0 && (
          <div className="mt-2">
            <button onClick={() => setShowReplies(!showReplies)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              {showReplies ? "Ocultar respuestas" : "Ver " + replies.length + " " + (replies.length === 1 ? "respuesta" : "respuestas")}
            </button>
            {showReplies && (
              <div className="mt-3 space-y-4">
                {replies.map((reply: Comment) => (
                  <CommentReply 
                    key={reply.id} 
                    comment={reply} 
                    entityType={entityType} 
                    currentUserId={currentUserId} 
                    allowComments={allowComments} 
                    onReply={() => onReply(comment.id, reply.author.username)} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CommentReply({ comment, entityType, currentUserId, allowComments, onReply, onDelete }: {
  comment: Comment
  entityType: string
  currentUserId: string | null
  allowComments: boolean
  onReply: () => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content || "")
  const [localContent, setLocalContent] = useState(comment.content || "")
  const [localMediaUrl, setLocalMediaUrl] = useState(comment.media_url)
  const [localMediaType, setLocalMediaType] = useState(comment.media_type)
  const [removeMedia, setRemoveMedia] = useState(false)
  const [isPending, startTransition] = useTransition()

  const getAvatar = (path?: string) => path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${path}` : null
  const isOwn = Boolean(
    currentUserId && (
      (comment.author?.id && currentUserId === comment.author.id) ||
      ((comment as any).author_id && currentUserId === (comment as any).author_id)
    )
  )
  const avatar = getAvatar(comment.author.avatar?.storage_path)

  const handleEdit = () => {
    if (editContent.trim() === localContent && !removeMedia) {
      setIsEditing(false)
      return
    }
    startTransition(async () => {
      try {
        await editComment(entityType as any, comment.id, editContent, removeMedia)
        setLocalContent(editContent.trim())
        if (removeMedia) {
          setLocalMediaUrl(null)
          setLocalMediaType(null)
        }
        setIsEditing(false)
      } catch (e) {
        setEditContent(localContent)
        setRemoveMedia(false)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Link href={"/@" + comment.author.username} className="w-6 h-6 rounded-full bg-muted shrink-0 overflow-hidden block mt-1 relative">
        {avatar && <MediaImage src={avatar} alt={comment.author.username} className="w-full h-full object-cover" fill={true} variant="avatar" fallbackType="avatar" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl p-2.5 inline-block min-w-[150px] max-w-full pr-6 relative">
          <div className="flex items-center gap-1.5 mb-1 relative z-10">
            <Link href={"/@" + comment.author.username} className="font-bold text-xs hover:underline">{comment.author.display_name || comment.author.username}</Link>
            <span className="text-[11px] text-muted-foreground font-normal">· {formatRelativeTime(comment.created_at)}</span>
          </div>

          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2 relative z-10">
              <textarea 
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full text-xs bg-background border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                autoFocus
              />
              
              {localMediaUrl && !removeMedia && (
                <div className="relative inline-block self-start my-1">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border shadow-xs bg-muted">
                    <img src={localMediaUrl} alt="Adjunto" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setRemoveMedia(true)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-background border border-border text-destructive shadow-xs transition-colors"
                      title="Eliminar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setIsEditing(false); setRemoveMedia(false); }} disabled={isPending}>Cancelar</Button>
                <Button size="sm" className="h-7 text-xs px-2" onClick={handleEdit} disabled={isPending || (!editContent.trim() && (removeMedia || !localMediaUrl))}>Guardar</Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {localContent && (
                <p className={cn("text-sm whitespace-pre-wrap relative z-10", comment.is_deleted && "text-muted-foreground italic")}>
                  <SocialTextRenderer text={localContent} />
                </p>
              )}

              {!comment.is_deleted && localMediaUrl && (
                <div className="mt-2 max-w-[220px] rounded-2xl overflow-hidden border border-border/70 bg-card shadow-xs relative z-10">
                  {localMediaType === 'IMAGE' ? (
                    <ExpandableImage
                      src={localMediaUrl}
                      alt="Foto en respuesta"
                      className="w-full max-h-[160px] object-cover rounded-2xl block"
                    />
                  ) : (
                    <img
                      src={localMediaUrl}
                      alt="GIF"
                      className="w-full max-h-[150px] object-cover rounded-2xl block"
                      loading="lazy"
                    />
                  )}
                </div>
              )}

              {!comment.is_deleted && <CommentReactionUI comment={comment} entityType={entityType} currentUserId={currentUserId} />}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 px-2 text-[11px] text-muted-foreground font-medium relative z-10">
          <button onClick={() => document.getElementById(`reaction-trigger-${comment.id}`)?.click()} className="hover:text-foreground flex items-center gap-1" title="Reaccionar"><SmilePlus className="w-3.5 h-3.5"/></button>
          {allowComments && !comment.is_deleted && (
            <button onClick={onReply} className="hover:text-foreground">Responder</button>
          )}
          {isOwn && !comment.is_deleted && (
            <>
              <button onClick={() => setIsEditing(true)} className="hover:text-foreground" disabled={isPending}>Editar</button>
              <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>Eliminar</button>
            </>
          )}
          {!isOwn && !comment.is_deleted && (
            <ReportButton
              targetType="COMMENT_REPLY"
              targetId={comment.id}
              reportedUserId={comment.author.id}
              contentSnapshot={{
                replyId: comment.id,
                parentId: comment.parent_id,
                entityType,
                authorUsername: comment.author.username,
                content: comment.content,
                created_at: comment.created_at
              }}
              title="Reportar respuesta"
              variant="icon"
              label="Reportar respuesta"
              isAuthenticated={!!currentUserId}
              className="hover:text-destructive p-0"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function CommentSection({ 
  entityType, 
  entityId, 
  comments, 
  currentUserId, 
  allowComments, 
  onCommentAdded, 
  onCommentDeleted,
  hasMore = false,
  loadingMore = false,
  onLoadMore
}: CommentSectionProps & { 
  onCommentAdded?: (c: any) => void, 
  onCommentDeleted?: (id: string) => void,
  hasMore?: boolean,
  loadingMore?: boolean,
  onLoadMore?: () => void
}) {
  const { showAuthPrompt } = useAuthPrompt()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null)
  const [sortBy, setSortBy] = useState<"highlighted" | "recent">("highlighted")
  
  // Media state
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia>(null)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const autocomplete = useAutocomplete()
  
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  useEffect(() => { setLocalComments(comments) }, [comments])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Map replies for fast lookup
  const repliesMap = useMemo(() => {
    const map: Record<string, Comment[]> = {}
    localComments.forEach(c => {
      if (c.parent_id) {
        if (!map[c.parent_id]) map[c.parent_id] = []
        map[c.parent_id].push(c)
      }
    })
    return map
  }, [localComments])

  // Top level comments with sorting
  const sortedTopLevelComments = useMemo(() => {
    const roots = localComments.filter(c => !c.parent_id && !c.is_deleted)
    return [...roots].sort((a, b) => {
      if (sortBy === "highlighted") {
        const aReactions = a.reactions?.length || 0
        const aReplies = (repliesMap[a.id] || []).length
        const aScore = aReactions * 3 + aReplies * 2

        const bReactions = b.reactions?.length || 0
        const bReplies = (repliesMap[b.id] || []).length
        const bScore = bReactions * 3 + bReplies * 2

        if (bScore !== aScore) {
          return bScore - aScore
        }
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [localComments, sortBy, repliesMap])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      alert("La imagen no puede superar 15MB")
      return
    }

    if (selectedMedia?.type === "IMAGE") {
      URL.revokeObjectURL(selectedMedia.previewUrl)
    }

    const preview = URL.createObjectURL(file)
    setSelectedMedia({ type: "IMAGE", file, previewUrl: preview })
    e.target.value = ""
  }

  const handleSelectGif = (gif: GifItem) => {
    if (selectedMedia?.type === "IMAGE") {
      URL.revokeObjectURL(selectedMedia.previewUrl)
    }
    setSelectedMedia({
      type: "GIF",
      url: gif.url,
      metadata: { id: gif.id, title: gif.title, aspectRatio: gif.aspectRatio }
    })
    setShowGifPicker(false)
  }

  const handleRemoveMedia = () => {
    if (selectedMedia?.type === "IMAGE") {
      URL.revokeObjectURL(selectedMedia.previewUrl)
    }
    setSelectedMedia(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para participar en la conversación.")
      return
    }

    const trimmed = newComment.trim()
    if (!trimmed && !selectedMedia) return

    setIsUploadingMedia(true)

    try {
      let mediaPayload: { type: "IMAGE" | "GIF"; url: string; metadata?: any } | undefined = undefined

      if (selectedMedia?.type === "IMAGE") {
        const { prepareImage } = await import("@/services/media/client")
        const optimizedFile = await prepareImage(selectedMedia.file, "comments")
        const ext = "webp"
        const storagePath = `${currentUserId}/comments/${entityId}/${crypto.randomUUID()}.${ext}`
        const supabase = createClient()
        
        const { error: uploadError } = await supabase.storage
          .from("recipe_media")
          .upload(storagePath, optimizedFile, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage.from("recipe_media").getPublicUrl(storagePath)
        mediaPayload = {
          type: "IMAGE",
          url: publicUrl,
          metadata: {
            storage_path: storagePath,
            size: optimizedFile.size,
            original_name: selectedMedia.file.name
          }
        }
      } else if (selectedMedia?.type === "GIF") {
        mediaPayload = {
          type: "GIF",
          url: selectedMedia.url,
          metadata: selectedMedia.metadata
        }
      }

      startTransition(async () => {
        try {
          const newC = await createComment(
            entityType, 
            entityId, 
            trimmed, 
            replyingTo?.id, 
            mediaPayload
          )
          
          if (newC) {
            const optimisticComment: Comment = {
              ...newC,
              media_type: newC.media_type || mediaPayload?.type || null,
              media_url: newC.media_url || mediaPayload?.url || null,
              media_metadata: newC.media_metadata || mediaPayload?.metadata || null,
              author: (newC as any).author || { id: currentUserId, username: "tu", display_name: "Tú", avatar: null },
              reactions: []
            }
            setLocalComments(prev => [...prev, optimisticComment])
            if (onCommentAdded) onCommentAdded(optimisticComment)
          }
          
          setNewComment("")
          handleRemoveMedia()
          setReplyingTo(null)
        } catch (err) {
          console.error("Error creating comment:", err)
        } finally {
          setIsUploadingMedia(false)
        }
      })
    } catch (err) {
      console.error("Error handling media upload for comment:", err)
      alert("No se pudo subir la imagen. Por favor, inténtalo de nuevo.")
      setIsUploadingMedia(false)
    }
  }

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (commentId: string) => {
    setDeleteConfirmId(commentId)
  }

  const executeDelete = async () => {
    if (!deleteConfirmId) return
    const idToDelete = deleteConfirmId
    setDeleteConfirmId(null)

    // Optimistic delete
    setLocalComments(prev => prev.map(c => c.id === idToDelete ? { ...c, is_deleted: true, content: "Comentario eliminado", media_url: null, media_type: null } : c))
    if (onCommentDeleted) onCommentDeleted(idToDelete)

    try {
      await deleteComment(entityType, idToDelete, pathname)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Eliminar comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDestructive={true}
      />

      {/* Sorting bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {sortedTopLevelComments.length} {sortedTopLevelComments.length === 1 ? "comentario" : "comentarios"}
        </span>
        <div className="inline-flex items-center p-0.5 bg-muted/60 rounded-xl border border-border/50 text-xs">
          <button
            type="button"
            onClick={() => setSortBy("highlighted")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all",
              sortBy === "highlighted"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>Destacados</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy("recent")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all",
              sortBy === "recent"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Más recientes</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTopLevelComments.map(comment => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={(repliesMap[comment.id] || []).filter(r => !r.is_deleted).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
            entityType={entityType}
            currentUserId={currentUserId}
            allowComments={allowComments}
            onReply={(id: string, username: string) => {
              setReplyingTo({ id, username })
              if (!newComment.includes(`@${username}`)) {
                setNewComment(`@${username} ` + newComment)
              }
              setTimeout(() => {
                textareaRef.current?.focus()
              }, 10)
            }}
            onDelete={handleDelete}
          />
        ))}

        {hasMore && (
          <div className="pt-2 pb-1 text-center">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="text-xs font-semibold text-primary hover:underline transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Cargando más comentarios..." : "Ver más comentarios"}
            </button>
          </div>
        )}
      </div>
    
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-2 pb-safe-bottom z-10 w-full mt-4 border-t border-border/50">
        {allowComments ? (
          <form onSubmit={handleSubmit} className="space-y-2 mb-6">
            {replyingTo && (
              <div className="flex items-center justify-between bg-primary/10 text-primary text-sm px-3 py-2 rounded-lg">
                <span className="flex items-center gap-2"><Reply className="w-4 h-4" /> Respondiendo a @{replyingTo.username}</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:underline">Cancelar</button>
              </div>
            )}

            {/* Media preview before submission */}
            {selectedMedia && (
              <div className="relative inline-block mb-2 animate-in fade-in zoom-in-95">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border shadow-xs bg-muted">
                  <img
                    src={selectedMedia.type === "IMAGE" ? selectedMedia.previewUrl : selectedMedia.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background border border-border text-foreground shadow-xs transition-colors"
                    title="Quitar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <AutocompleteMenu 
                isOpen={autocomplete.isOpen}
                type={autocomplete.type}
                suggestions={autocomplete.suggestions}
                onSelect={(val) => {
                  const { newText, newCursorPos } = autocomplete.insertSuggestion(newComment, val)
                  setNewComment(newText)
                  if (textareaRef.current) {
                    textareaRef.current.focus()
                    setTimeout(() => {
                      if (textareaRef.current) {
                        textareaRef.current.selectionStart = newCursorPos
                        textareaRef.current.selectionEnd = newCursorPos
                      }
                    }, 0)
                  }
                }}
              />

              <div className="relative flex items-end border border-input rounded-3xl bg-transparent overflow-hidden px-2 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:border-primary/50 transition-all gap-1.5">
                {/* Hidden image input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={isPending || isUploadingMedia}
                />

                <textarea 
                  ref={textareaRef}
                  value={newComment}
                  onChange={e => {
                    setNewComment(e.target.value)
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                    autocomplete.handleInput(e.target.value, e.target.selectionStart)
                  }}
                  onClick={e => autocomplete.handleInput(e.currentTarget.value, e.currentTarget.selectionStart)}
                  onKeyUp={e => autocomplete.handleInput(e.currentTarget.value, e.currentTarget.selectionStart)}
                  placeholder={currentUserId ? (selectedMedia ? "Añade un texto opcional..." : "Añade un comentario...") : "Inicia sesión para comentar"}
                  className="flex-1 max-h-[120px] bg-transparent px-3 py-2 text-[15px] resize-none outline-none placeholder:text-muted-foreground"
                  style={{ height: "40px" }}
                  maxLength={1000}
                  disabled={isPending || isUploadingMedia}
                  readOnly={!currentUserId}
                />

                <div className="flex items-center gap-1 mb-1 shrink-0">
                  {/* Photo button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        showAuthPrompt("Crea tu cuenta para comentar con foto.")
                        return
                      }
                      fileInputRef.current?.click()
                    }}
                    disabled={isPending || isUploadingMedia}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      selectedMedia?.type === "IMAGE" 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    title="Añadir foto"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* GIF button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        showAuthPrompt("Crea tu cuenta para añadir un GIF.")
                        return
                      }
                      setShowGifPicker(true)
                    }}
                    disabled={isPending || isUploadingMedia}
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs font-bold tracking-wider transition-colors",
                      selectedMedia?.type === "GIF" 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    title="Añadir GIF"
                  >
                    GIF
                  </button>

                  {/* Submit button */}
                  <button 
                    type="submit" 
                    disabled={isPending || isUploadingMedia || (!newComment.trim() && !selectedMedia)} 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 transition-colors shrink-0"
                    title="Publicar"
                  >
                    {isUploadingMedia || isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-muted p-3 rounded-xl text-sm text-center text-muted-foreground mb-6">
            Los comentarios están desactivados para esta publicación.
          </div>
        )}
      </div>

      {/* GIF Picker Modal */}
      <CommentGifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleSelectGif}
      />
    </div>
  )
}
