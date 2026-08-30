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
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (isOpen && !fetched) {
      setLoading(true)
      getComments(entityType, entityId, currentUserId).then(data => {
        setComments(data)
        setLoading(false)
        setFetched(true)
      })
    }
  }, [isOpen, entityType, entityId, currentUserId, fetched])

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
        />
      )}
    </div>
  )
}
