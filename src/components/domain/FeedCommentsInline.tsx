"use client"

import { useEffect, useState } from "react"
import { getComments } from "@/app/actions/interactions"
import { CommentSection } from "@/components/domain/CommentSection"

interface FeedCommentsInlineProps {
  isOpen: boolean
  entityType: "recipe" | "session" | "post"
  entityId: string
  currentUserId: string | null
  allowComments: boolean
}

export function FeedCommentsInline({ isOpen, entityType, entityId, currentUserId, allowComments }: FeedCommentsInlineProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [fetched, setFetched] = useState(false)
  const PAGE_SIZE = 50

  useEffect(() => {
    if (isOpen && !fetched) {
      setLoading(true)
      setOffset(0)
      getComments(entityType, entityId, currentUserId, PAGE_SIZE, 0).then(data => {
        setComments(data)
        const rootCount = data.filter((c: any) => !c.parent_id).length
        setHasMore(rootCount >= PAGE_SIZE)
        setOffset(PAGE_SIZE)
        setLoading(false)
        setFetched(true)
      })
    }
  }, [isOpen, entityType, entityId, currentUserId, fetched])

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
    <div className="pt-4 border-t border-border mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {loading ? (
        <div className="flex justify-center py-4 text-muted-foreground text-sm">Cargando comentarios...</div>
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
  )
}
