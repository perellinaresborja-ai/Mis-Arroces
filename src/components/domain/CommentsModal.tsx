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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setLoading(true)
      getComments(entityType, entityId, currentUserId).then(data => {
        setComments(data)
        setLoading(false)
      })
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen, entityType, entityId, currentUserId])

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
            {isOwner && <PostOptionsMenu entityType={entityType} entityId={entityId} allowComments={allowComments} onDeleted={onClose} />}
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
            />
          )}
        </div>
      </div>
    </div>
  )
}
