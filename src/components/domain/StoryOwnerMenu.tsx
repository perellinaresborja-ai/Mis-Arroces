"use client"

import { useState } from "react"
import { BarChart2, Link as LinkIcon, Star, Trash2, Check } from "lucide-react"
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
  const [copied, setCopied] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStory(storyId);
      onDeleted();
    } catch (e: unknown) {
      console.error("Error al eliminar la historia:", e);
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?story=${storyId}` : '';
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card text-foreground border border-border w-full max-w-sm rounded-t-3xl p-4 flex flex-col gap-2 animate-in slide-in-from-bottom-full duration-200 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-2" />
        
        {copied && (
          <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Enlace copiado al portapapeles</span>
          </div>
        )}

        <button onClick={() => { onClose(); onOpenInsights(); }} className="flex items-center gap-3 p-3 hover:bg-muted rounded-2xl font-medium transition-colors text-sm">
          <BarChart2 className="w-5 h-5 text-primary" />
          <span>Actividad y estadísticas</span>
        </button>
        
        <button onClick={() => { onClose(); onOpenHighlight(); }} className="flex items-center gap-3 p-3 hover:bg-muted rounded-2xl font-medium transition-colors text-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          <span>Añadir a destacadas</span>
        </button>
        
        <button onClick={handleCopyLink} className="flex items-center gap-3 p-3 hover:bg-muted rounded-2xl font-medium transition-colors text-sm">
          <LinkIcon className="w-5 h-5" />
          <span>{copied ? "¡Enlace copiado!" : "Copiar enlace"}</span>
        </button>
        
        <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-2xl font-medium transition-colors mt-1 text-sm">
          <Trash2 className="w-5 h-5" />
          <span>{isDeleting ? "Eliminando..." : "Eliminar historia"}</span>
        </button>
        
        <button onClick={onClose} className="p-3 bg-muted rounded-2xl font-bold mt-2 hover:bg-muted/80 transition-colors text-sm">
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
