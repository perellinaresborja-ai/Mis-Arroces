"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Pencil } from "lucide-react"
import { deleteRecipe } from "@/app/actions/recipes"
import { useRouter } from "next/navigation"
import { MediaImage } from "./MediaImage"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export function CookbookRecipeCard({ recipe, tab }: { recipe: any, tab: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const mediaArray = recipe.recipe_media
  const sorted = mediaArray ? [...mediaArray].sort((a: any, b: any) => (a.display_order||0) - (b.display_order||0)) : []
  const path = sorted[0]?.media?.storage_path
  const coverUrl = path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${path}` : null

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  }

  const confirmDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Error al eliminar la receta. Es posible que tenga dependencias (comentarios/historias) que lo impidan.")
      setIsDeleting(false)
    }
  }

  const isScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date()

  return (
    <div className="flex flex-col w-full group relative" style={{ opacity: isDeleting ? 0.5 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}>
      <Link 
        href={`/recipes/${recipe.id}`}
        className="aspect-square bg-muted cursor-pointer overflow-hidden border border-border/50 rounded-xl relative block"
      >
        <MediaImage 
          src={coverUrl} 
          alt={recipe.name} 
          variant="feed"
          fallbackType="recipe"
          className="w-full h-full object-cover transition-transform md:group-hover:scale-105" 
        />
        
        {tab === 'mine' && (
          <div className="absolute top-1.5 left-1.5 z-10 flex gap-1">
            {isScheduled && (
              <span className="bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                Prog
              </span>
            )}
          </div>
        )}
      </Link>

      {tab === 'mine' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/50 hover:bg-primary text-white p-1.5 rounded-full transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleDelete}
            className="bg-black/50 hover:bg-destructive text-white p-1.5 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar receta"
        message="¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
