"use client"

import { useState } from "react"
import { MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toggleComments, deleteEntity, toggleBookmark } from "@/app/actions/post_options"

export function PostOptionsMenu({ 
  entityType, 
  entityId, 
  allowComments, 
  onDeleted 
}: { 
  entityType: string
  entityId: string
  allowComments: boolean
  onDeleted?: () => void 
}) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const handleGuardar = async () => {
    setShowMenu(false);
    try {
      await toggleBookmark(entityType, entityId);
      alert("Guardado actualizado");
    } catch (e: any) {
      alert(e.message?.includes('bookmarks') ? "Falta crear la tabla bookmarks en Supabase para guardar posts" : "Error al guardar");
    }
  }

  const handleDesactivar = async () => {
    setShowMenu(false);
    try {
      await toggleComments(entityType, entityId, allowComments);
      alert(allowComments ? "Comentarios desactivados" : "Comentarios activados");
      router.refresh();
    } catch (e) {
      alert("Error al cambiar estado de comentarios");
    }
  }

  const handleEditar = () => {
    setShowMenu(false);
    if (entityType === 'recipe') {
      router.push(`/recipes/${entityId}/edit`);
    } else {
      alert("La página de edición para este tipo está en construcción");
    }
  }

  const handleEliminar = async () => {
    if (!confirm("¿Seguro que quieres eliminar esta publicación de forma permanente?")) return;
    setShowMenu(false);
    try {
      await deleteEntity(entityType, entityId);
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (e) {
      alert("Error al eliminar");
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)} 
        className="p-2 hover:bg-muted rounded-full transition-colors"
      >
        <MoreHorizontal className="w-5 h-5 text-foreground" />
      </button>
      
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button onClick={handleGuardar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
              <Bookmark className="w-4 h-4" /> Guardar
            </button>
            <button onClick={handleDesactivar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
              <MessageSquareOff className="w-4 h-4" /> {allowComments ? 'Desactivar comentarios' : 'Activar comentarios'}
            </button>
            <button onClick={handleEditar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
              <Edit2 className="w-4 h-4" /> Editar
            </button>
            <button onClick={handleEliminar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-destructive/10 text-destructive font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> Eliminar publicación
            </button>
          </div>
        </>
      )}
    </div>
  )
}
