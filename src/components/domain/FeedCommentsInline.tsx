"use client"

import { useEffect, useState, useCallback } from "react"
import { getComments } from "@/app/actions/interactions"
import { CommentSection } from "@/components/domain/CommentSection"

interface FeedCommentsInlineProps {
  isOpen: boolean
  entityType: "recipe" | "session" | "post"
  entityId: string
  currentUserId: string | null
  allowComments: boolean
}

interface CommentsCacheEntry {
  comments: any[]
  hasMore: boolean
  timestamp: number
}

// Module-level in-memory cache for instant opening without network lag
export const commentsMemoryCache = new Map<string, CommentsCacheEntry>()

export function prefetchComments(
  entityType: "recipe" | "session" | "post",
  entityId: string,
  currentUserId: string | null,
  limit: number = 20
) {
  if (typeof window === "undefined") return
  const cacheKey = `${entityType}:${entityId}`
  const cached = commentsMemoryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < 30000) return

  getComments(entityType, entityId, currentUserId, limit, 0)
    .then(data => {
      const rootCount = data.filter((c: any) => !c.parent_id).length
      commentsMemoryCache.set(cacheKey, {
        comments: data,
        hasMore: rootCount >= limit,
        timestamp: Date.now()
      })
    })
    .catch(() => {})
}

export function FeedCommentsInline({ isOpen, entityType, entityId, currentUserId, allowComments }: FeedCommentsInlineProps) {
  const cacheKey = `${entityType}:${entityId}`
  const cached = commentsMemoryCache.get(cacheKey)
  const PAGE_SIZE = 20

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
      const currentCached = commentsMemoryCache.get(cacheKey)
      const isFresh = currentCached && Date.now() - currentCached.timestamp < 30000
      if (!isFresh) {
        loadInitialComments(Boolean(currentCached))
      } else if (currentCached) {
        setComments(currentCached.comments)
        setHasMore(currentCached.hasMore)
        setLoading(false)
      }
    }
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

  if (!isOpen) return null

  return (
    <div className="pt-4 border-t border-border mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
  )
}
