"use client"

import { useState } from "react"
import { MoreHorizontal, BarChart2, Share2, Link as LinkIcon, Star, Trash2, X } from "lucide-react"
import { deleteStory } from "@/app/actions/stories"


import { ConfirmModal } from "@/components/ui/ConfirmModal"

interface StoryOwnerMenuProps {
  storyId: string;
  onClose: () => void;
  onDeleted: () => void;
  onOpenInsights: () => void;
  onOpenHighlight: () => void;
}

export function StoryOwnerMenu({ storyId, onClose, onDeleted, onOpenInsights, onOpenHighlight }: StoryOwnerMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStory(storyId);
      onDeleted();
    } catch (e: any) {
      alert("Error al eliminar la historia");
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleCopyLink = () => {
    // Assuming the path to a story is /stories/[id] or just sharing the app link
    // For now, we can share a deep link if implemented, else fallback
    navigator.clipboard.writeText(window.location.origin + "/stories/" + storyId);
    alert("Éxito");
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card text-foreground w-full max-w-sm rounded-t-3xl p-4 flex flex-col gap-2 animate-in slide-in-from-bottom-full duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
        
        <button onClick={() => { onClose(); onOpenInsights(); }} className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl font-medium transition-colors">
          <BarChart2 className="w-5 h-5 text-primary" />
          <span>Actividad y estadísticas</span>
        </button>
        
        <button onClick={() => { onClose(); onOpenHighlight(); }} className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl font-medium transition-colors">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Añadir a destacadas</span>
        </button>
        
        <button onClick={handleCopyLink} className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl font-medium transition-colors">
          <LinkIcon className="w-5 h-5" />
          <span>Copiar enlace</span>
        </button>
        
        <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl font-medium transition-colors mt-2">
          <Trash2 className="w-5 h-5" />
          <span>{isDeleting ? "Eliminando..." : "Eliminar historia"}</span>
        </button>
        
        <button onClick={onClose} className="p-3 bg-muted rounded-xl font-bold mt-2 hover:bg-muted/80 transition-colors">
          Cancelar
        </button>
      </div>
      <ConfirmModal 
        isOpen={showConfirm}
        title="Eliminar historia"
        message="¿Estás seguro de que quieres eliminar esta historia de forma permanente?"
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
