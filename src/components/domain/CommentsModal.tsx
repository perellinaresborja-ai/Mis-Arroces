"use client"

import { useEffect, useState } from "react"
import { getComments } from "@/app/actions/interactions"
import { CommentSection } from "@/components/domain/CommentSection"
import { X } from "lucide-react"
import { PostOptionsMenu } from "./PostOptionsMenu"
import { toggleComments, deleteEntity, toggleBookmark } from "@/app/actions/post_options"
import { useRouter } from "next/navigation"

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: "recipe" | "session" | "post"
  entityId: string
  currentUserId: string | null
    isOwner?: boolean
  allowComments: boolean
}

export function CommentsModal({ isOpen, onClose, entityType, entityId, currentUserId, isOwner, allowComments }: CommentsModalProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const router = useRouter()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const PAGE_SIZE = 50

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setLoading(true)
      setOffset(0)
      getComments(entityType, entityId, currentUserId, PAGE_SIZE, 0).then(data => {
        setComments(data)
        const rootCount = data.filter((c: any) => !c.parent_id).length
        setHasMore(rootCount >= PAGE_SIZE)
        setOffset(PAGE_SIZE)
        setLoading(false)
      })
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen, entityType, entityId, currentUserId])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextBatch = await getComments(entityType, entityId, currentUserId, PAGE_SIZE, offset)
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

  if (!isOpen) return null

  const handleCommentAdded = (newComment: any) => {
    setComments(prev => [...prev, newComment])
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_deleted: true, content: "Comentario eliminado" } : c))
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-card border border-border md:rounded-2xl rounded-t-2xl w-full max-w-lg md:max-h-[85vh] max-h-[90vh] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0 relative">
          <h2 className="font-bold text-lg">Comentarios</h2>
          <div className="flex items-center gap-2">
            {isOwner && <PostOptionsMenu entityType={entityType} entityId={entityId} allowComments={allowComments} onDeleted={onClose} hidePin={true} />}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground">Cargando comentarios...</div>
          ) : (
            <CommentSection 
              entityType={entityType}
              entityId={entityId}
              comments={comments}
              currentUserId={currentUserId}
              allowComments={allowComments}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </div>
    </div>
  )
}
