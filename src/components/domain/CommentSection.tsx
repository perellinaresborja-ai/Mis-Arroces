"use client"
import { MediaImage } from "@/components/domain/MediaImage"
// @ts-nocheck
import React, { useState, useTransition, useRef, useEffect } from "react"
import { createComment, deleteComment, editComment, toggleCommentLike } from "@/app/actions/interactions"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Reply, ChevronDown, ChevronUp, ArrowUp } from "lucide-react"
import { PaellaLike } from "./PaellaLike"
import { useAutocomplete } from "@/hooks/useAutocomplete"
import { AutocompleteMenu } from "./AutocompleteMenu"
import { SocialTextRenderer } from "./SocialTextRenderer"
import Link from "next/link"
import { cn, formatRelativeTime } from "@/lib/utils"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

interface Comment {
  id: string
  content: string
  is_deleted: boolean
  created_at: string
  parent_id: string | null
  like_count?: number
  user_liked?: boolean
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

function CommentThread({ 
  comment, 
  replies, 
  entityType, 
  currentUserId, 
  allowComments, 
  onReply, 
  onDelete 
}: { 
  comment: Comment
  replies: Comment[]
  entityType: "recipe" | "session" | "post"
  currentUserId: string | null
  allowComments: boolean
  onReply: (id: string, username: string) => void
  onDelete: (id: string) => void
}) {
  const { showAuthPrompt } = useAuthPrompt()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [showReplies, setShowReplies] = useState(false)
  
  const [isLiked, setIsLiked] = useState(comment.user_liked || false)
  const [likeCount, setLikeCount] = useState(comment.like_count || 0)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [localContent, setLocalContent] = useState(comment.content)

  const handleEdit = () => {
    if (editContent.trim() === localContent) {
      setIsEditing(false)
      return
    }
    startTransition(async () => {
      try {
        await editComment(entityType, comment.id, editContent)
        setLocalContent(editContent.trim())
        setIsEditing(false)
      } catch(e) {
        setEditContent(localContent)
      }
    })
  }

  const handleLike = () => {
    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para participar en la conversación.")
      return
    }

    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev: number) => newIsLiked ? prev + 1 : Math.max(0, prev - 1))

    startTransition(async () => {
      try {
        await toggleCommentLike(entityType, comment.id, !newIsLiked)
      } catch (e) {
        setIsLiked(!newIsLiked)
        setLikeCount((prev: number) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1))
      }
    })
  }

  const getAvatar = (path?: string) => path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${path}`
    : null

  const isOwn = currentUserId === comment.author.id
  const avatar = getAvatar(comment.author.avatar?.storage_path)

  return (
    <div className="flex gap-3">
      <Link href={"/@" + comment.author.username} className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden block mt-1">
        {avatar && <MediaImage src={avatar} alt={comment.author.username} className="w-full h-full object-cover" fill={true} />}
      </Link>
      <div className="flex-1">
        <div className="bg-muted/50 rounded-2xl p-3 w-full">
          <div className="flex items-center gap-1.5 mb-1">
            <Link href={"/@" + comment.author.username} className="font-bold text-sm hover:underline">
              {comment.author.display_name}
            </Link>
            <span className="text-xs text-muted-foreground font-normal">· {formatRelativeTime(comment.created_at)}</span>
          </div>
          
          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2">
              <textarea 
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full text-sm bg-background border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending}>Cancelar</Button>
                <Button size="sm" onClick={handleEdit} disabled={isPending || !editContent.trim()}>Guardar</Button>
              </div>
            </div>
          ) : (
            <p className={cn("text-sm whitespace-pre-wrap", comment.is_deleted && "text-muted-foreground italic")}>
              <SocialTextRenderer text={localContent} />
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">
          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
            </button>
          )}

          {allowComments && !comment.is_deleted && (
            <button onClick={() => onReply(comment.id, comment.author.username)} className="hover:text-foreground">
              Responder
            </button>
          )}
          
          {isOwn && !comment.is_deleted && (
            <>
              <button onClick={() => setIsEditing(true)} className="hover:text-foreground" disabled={isPending}>
                Editar
              </button>
              <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>
                Eliminar
              </button>
            </>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-2">
            <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <span className="w-6 border-b border-border mr-1 inline-block" />
              {showReplies ? "Ocultar respuestas" : "Ver " + replies.length + " respuestas"}
            </button>
            
            {showReplies && (
              <div className="mt-3 space-y-4">
                {replies.map(reply => (
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

function CommentReply({ 
  comment,
  entityType,
  currentUserId,
  allowComments,
  onReply,
  onDelete
}: any) {
  const { showAuthPrompt } = useAuthPrompt()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [isLiked, setIsLiked] = useState(comment.user_liked || false)
  const [likeCount, setLikeCount] = useState(comment.like_count || 0)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [localContent, setLocalContent] = useState(comment.content)

  const handleEdit = () => {
    if (editContent.trim() === localContent) {
      setIsEditing(false)
      return
    }
    startTransition(async () => {
      try {
        await editComment(entityType, comment.id, editContent)
        setLocalContent(editContent.trim())
        setIsEditing(false)
      } catch(e) {
        setEditContent(localContent)
      }
    })
  }

  const handleLike = () => {
    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para participar en la conversación.")
      return
    }

    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev: number) => newIsLiked ? prev + 1 : Math.max(0, prev - 1))

    startTransition(async () => {
      try {
        await toggleCommentLike(entityType, comment.id, !newIsLiked)
      } catch (e) {
        setIsLiked(!newIsLiked)
        setLikeCount((prev: number) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1))
      }
    })
  }

  const getAvatar = (path?: string) => path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${path}`
    : null

  const isOwn = currentUserId === comment.author.id
  const avatar = getAvatar(comment.author.avatar?.storage_path)

  return (
    <div className="flex gap-3">
      <Link href={"/@" + comment.author.username} className="w-6 h-6 rounded-full bg-muted shrink-0 overflow-hidden block">
        {avatar && <MediaImage src={avatar} alt={comment.author.username} className="w-full h-full object-cover" fill={true} />}
      </Link>
      <div className="flex-1">
        <div className="bg-muted/50 rounded-2xl p-2.5 inline-block min-w-[150px] pr-6">
          <div className="flex items-center gap-1.5 mb-1">
            <Link href={"/@" + comment.author.username} className="font-bold text-xs hover:underline">
              {comment.author.display_name}
            </Link>
            <span className="text-[11px] text-muted-foreground font-normal">· {formatRelativeTime(comment.created_at)}</span>
          </div>
          <p className={cn("text-sm whitespace-pre-wrap", comment.is_deleted && "text-muted-foreground italic")}>
            <SocialTextRenderer text={localContent} />
          </p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-2 text-[11px] text-muted-foreground font-medium">
          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
            </button>
          )}

          {allowComments && !comment.is_deleted && (
            <button onClick={onReply} className="hover:text-foreground">
              Responder
            </button>
          )}
          
          {isOwn && !comment.is_deleted && (
            <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function CommentSection({ entityType, entityId, comments, currentUserId, allowComments, onCommentAdded, onCommentDeleted }: CommentSectionProps & { onCommentAdded?: (c: any) => void, onCommentDeleted?: (id: string) => void }) {
  const { showAuthPrompt } = useAuthPrompt()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null)
  
  const autocomplete = useAutocomplete()
  
  const [localComments, setLocalComments] = useState(comments)
  useEffect(() => { setLocalComments(comments) }, [comments])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Organize comments into threads
  const topLevelComments = localComments.filter(c => !c.parent_id)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para participar en la conversación.")
      return
    }
    if (!newComment.trim()) return

    startTransition(async () => {
      try {
        let contentToSubmit = newComment.trim()
        const newC = await createComment(entityType, entityId, contentToSubmit, replyingTo?.id)
        
        // Optimistic update
        if (newC) {
          const optimisticComment = {
            ...newC,
            author: { id: currentUserId, username: "tu", display_name: "Tú", avatar: null }
          }
          setLocalComments(prev => [...prev, optimisticComment])
          if (onCommentAdded) onCommentAdded(optimisticComment)
        }
        
        setNewComment("")
        setReplyingTo(null)
      } catch (err) {
        console.error(err)
      }
    })
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (commentId: string) => {
    setConfirmDeleteId(commentId);
  }

  const confirmDeleteAction = () => {
    if (!confirmDeleteId) return;
    startTransition(async () => {
      setLocalComments(prev => prev.map(c => c.id === confirmDeleteId ? { ...c, is_deleted: true, content: "Comentario eliminado" } : c))
      await deleteComment(entityType, confirmDeleteId)
      if (onCommentDeleted) onCommentDeleted(confirmDeleteId)
      setConfirmDeleteId(null)
    })
  }

  return (
    <div className="space-y-6">
      
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDeleteAction}
        title="Eliminar comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDestructive={true}
      />

      <div className="space-y-4">
        {topLevelComments.filter(c => !c.is_deleted).map(comment => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={localComments.filter(r => r.parent_id === comment.id && !r.is_deleted)}
            entityType={entityType}
            currentUserId={currentUserId}
            allowComments={allowComments}
            onReply={(id, username) => {
              setReplyingTo({ id, username })
              if (!newComment.includes(`@${username}`)) {
                setNewComment(`@${username} ` + newComment)
              }
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            }}
            onDelete={handleDelete}
          />
        ))}
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
            <div className="relative flex items-end border border-input rounded-3xl bg-transparent overflow-hidden px-1 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:border-primary/50 transition-all">
              <textarea 
                ref={textareaRef}
                value={newComment}
                onChange={e => {
                  setNewComment(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  autocomplete.handleInput(e.target.value, e.target.selectionStart)
                }}
                onClick={e => autocomplete.handleInput(e.currentTarget.value, e.currentTarget.selectionStart)}
                onKeyUp={e => autocomplete.handleInput(e.currentTarget.value, e.currentTarget.selectionStart)}
                placeholder={currentUserId ? "Añade un comentario..." : "Inicia sesión para comentar"}
                className="flex-1 max-h-[120px] bg-transparent px-4 py-2 text-[15px] resize-none outline-none placeholder:text-muted-foreground"
                style={{ height: '40px' }}
                maxLength={1000}
                disabled={isPending}
                  
                  readOnly={!currentUserId}
              />
              <button 
                  type="submit" 
                  disabled={isPending || !newComment.trim()} 
                  className="flex items-center justify-center w-8 h-8 mx-2 mb-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 transition-colors shrink-0"
                  title="Publicar"
                >
                  <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-muted p-3 rounded-xl text-sm text-center text-muted-foreground mb-6">
          Los comentarios están desactivados para esta publicación.
        </div>
      )}
      </div>
</div>
  )
}
