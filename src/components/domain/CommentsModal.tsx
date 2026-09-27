"use client"

import { useEffect, useState, useCallback } from "react"
import { getComments } from "@/app/actions/interactions"
import { CommentSection } from "@/components/domain/CommentSection"
import { commentsMemoryCache } from "@/components/domain/FeedCommentsInline"
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
  const cacheKey = `${entityType}:${entityId}`
  const cached = commentsMemoryCache.get(cacheKey)
  const PAGE_SIZE = 20

  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const router = useRouter()
  const [comments, setComments] = useState<any[]>(() => cached ? cached.comments : [])
  const [loading, setLoading] = useState<boolean>(() => !cached)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState<boolean>(() => cached ? cached.hasMore : false)
  const [offset, setOffset] = useState<number>(() => cached ? PAGE_SIZE : 0)

  const loadInitialComments = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true)
    }
    try {
      const data = await getComments(entityType, entityId, currentUserId, PAGE_SIZE, 0)
      const rootCount = data.filter((c: any) => !c.parent_id).length
      const more = rootCount >= PAGE_SIZE
      commentsMemoryCache.set(cacheKey, {
        comments: data,
        hasMore: more,
        timestamp: Date.now()
      })
      setComments(data)
      setHasMore(more)
      setOffset(PAGE_SIZE)
    } catch (e) {
      console.error("Error loading comments:", e)
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, currentUserId, cacheKey, PAGE_SIZE])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      const currentCached = commentsMemoryCache.get(cacheKey)
      const isFresh = currentCached && Date.now() - currentCached.timestamp < 30000
      if (!isFresh) {
        loadInitialComments(Boolean(currentCached))
      } else if (currentCached) {
        setComments(currentCached.comments)
        setHasMore(currentCached.hasMore)
        setLoading(false)
      }
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen, cacheKey, loadInitialComments])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextBatch = await getComments(entityType, entityId, currentUserId, PAGE_SIZE, offset)
      const nextRootCount = nextBatch.filter((c: any) => !c.parent_id).length
      setComments(prev => {
        const existingIds = new Set(prev.map((c: any) => c.id))
        const newUnique = nextBatch.filter((c: any) => !existingIds.has(c.id))
        const updated = [...prev, ...newUnique]
        const more = nextRootCount >= PAGE_SIZE
        commentsMemoryCache.set(cacheKey, {
          comments: updated,
          hasMore: more,
          timestamp: Date.now()
        })
        return updated
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
    setComments(prev => {
      const updated = [...prev, newComment]
      commentsMemoryCache.set(cacheKey, {
        comments: updated,
        hasMore,
        timestamp: Date.now()
      })
      return updated
    })
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => {
      const updated = prev.map(c => c.id === commentId ? { ...c, is_deleted: true, content: "Comentario eliminado" } : c)
      commentsMemoryCache.set(cacheKey, {
        comments: updated,
        hasMore,
        timestamp: Date.now()
      })
      return updated
    })
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
          <CommentSection 
            entityType={entityType}
            entityId={entityId}
            comments={comments}
            currentUserId={currentUserId}
            allowComments={allowComments}
            isLoading={loading}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  )
}
