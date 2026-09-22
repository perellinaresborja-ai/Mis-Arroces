"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Pencil } from "lucide-react"
import { deleteRecipe } from "@/app/actions/recipes"
import { useRouter } from "next/navigation"
import { MediaImage } from "./MediaImage"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/button"

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
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Error desconocido al eliminar la receta.")
      setIsDeleting(false)
    }
  }

  const isScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date()

  let fallbackText = "";
  if (recipe.name?.trim()) {
    fallbackText = recipe.name;
  } else if (recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && recipe.recipe_ingredients[0].display_text?.trim()) {
    fallbackText = recipe.recipe_ingredients[0].display_text;
  } else if (recipe.variety?.name?.trim()) {
    fallbackText = recipe.variety.name;
  } else {
    fallbackText = "Borrador de receta";
  }

  return (
    <div className="flex flex-col w-full group relative" style={{ opacity: isDeleting ? 0.5 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}>
      <Link 
        href={`/recipes/${recipe.id}`}
        className="aspect-square bg-muted cursor-pointer overflow-hidden border border-border/50 rounded-xl relative block"
      >
        {coverUrl ? (
          <MediaImage 
            src={coverUrl} 
            alt={recipe.name || "Receta"} 
            variant="feed"
            className="w-full h-full object-cover transition-transform md:group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full p-4 flex items-center justify-center text-center transition-transform md:group-hover:scale-105 bg-card">
            <h3 className="text-xl md:text-2xl font-bold text-foreground line-clamp-4 leading-tight">
              {fallbackText}
            </h3>
          </div>
        )}
        
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

      {tab === 'want' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDeleting(true);
              const { toggleWantToCook } = await import("@/app/actions/recipes");
              await toggleWantToCook(recipe.id, false);
              router.refresh();
            }}
            className="bg-black/50 hover:bg-destructive text-white p-1.5 rounded-full transition-colors"
            title="Quitar de Voy a cocinar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {tab === 'want' && (
        <div className="mt-2 w-full">
          <Link href={`/recipes/${recipe.id}/cook`}>
            <Button className="w-full rounded-xl font-bold text-xs" size="sm">
              Empezar a cocinar
            </Button>
          </Link>
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
