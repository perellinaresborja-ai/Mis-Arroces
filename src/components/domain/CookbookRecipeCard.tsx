"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Trash2, Pencil, MoreHorizontal } from "lucide-react"
import { deleteRecipe } from "@/app/actions/recipes"
import { useRouter } from "next/navigation"
import { MediaImage } from "./MediaImage"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

export function CookbookRecipeCard({ recipe, tab }: { recipe: any, tab: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [showMenu])

  const mediaArray = recipe.recipe_media
  const sorted = mediaArray ? [...mediaArray].sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order||0) - (b.display_order||0)) : []
  const path = sorted[0]?.media?.storage_path || sorted[0]?.media_assets?.storage_path
  const coverUrl = path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${path}` : null

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    setShowConfirm(false)
    setIsDeleting(true)
    try {
      const res = await deleteRecipe(recipe.id)
      if (res && !res.success) {
        alert(res.error || "No se pudo eliminar la receta.")
        setIsDeleting(false)
        return
      }
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting recipe:", err)
      alert(err?.message || "Error desconocido al eliminar la receta.")
      setIsDeleting(false)
    }
  }

  const isScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date()

  let fallbackText = ""
  if (recipe.name?.trim()) {
    fallbackText = recipe.name
  } else if (recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && recipe.recipe_ingredients[0].display_text?.trim()) {
    fallbackText = recipe.recipe_ingredients[0].display_text
  } else if (recipe.variety?.name?.trim()) {
    fallbackText = recipe.variety.name
  } else {
    fallbackText = "Borrador de receta"
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
            <h3 className="text-sm md:text-2xl font-semibold md:font-bold text-foreground line-clamp-3 md:line-clamp-4 leading-tight">
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
        <>
          {/* MÓVIL: Botón ⋯ ultra discreto sin círculo de fondo, con amplio touch target */}
          <div ref={menuRef} className="md:hidden absolute top-1 right-1 z-30">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu((prev) => !prev)
              }}
              className={cn(
                "p-2 flex items-center justify-center bg-transparent transition-transform active:scale-90",
                coverUrl 
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" 
                  : "text-foreground/60 hover:text-foreground"
              )}
              aria-label="Opciones de receta"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute top-8 right-1 z-40 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-1 min-w-[125px] animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-xl transition-colors w-full"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Editar</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors w-full text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>

          {/* ESCRITORIO: Botones visibles en hover */}
          <div className="hidden md:flex absolute top-2 right-2 z-20 items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/50 hover:bg-primary text-white p-1.5 rounded-full transition-colors"
              title="Editar receta"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleDelete}
              className="bg-black/50 hover:bg-destructive text-white p-1.5 rounded-full transition-colors"
              title="Eliminar receta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
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
