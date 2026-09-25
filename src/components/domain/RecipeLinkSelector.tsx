"use client"

import { useState } from "react"
import { ChefHat, X } from "lucide-react"
import { RecipePicker } from "@/components/domain/stories/StickerPickers"

export interface LinkedRecipeInfo {
  id: string
  name: string
  subtitle?: string
}

export function RecipeLinkSelector({
  recipe,
  onSelectRecipe,
}: {
  recipe: LinkedRecipeInfo | null
  onSelectRecipe: (r: LinkedRecipeInfo | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (r: { id: string; title: string; subtitle?: string }) => {
    onSelectRecipe({
      id: r.id,
      name: r.title,
      subtitle: r.subtitle,
    })
    setIsOpen(false)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectRecipe(null)
  }

  return (
    <div>
      {recipe ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs text-muted-foreground font-medium">Receta vinculada</span>
              <span className="text-sm font-bold truncate">{recipe.name}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Desvincular receta"
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-colors text-sm font-medium text-foreground w-full sm:w-auto"
        >
          <ChefHat className="w-4 h-4 text-primary shrink-0" />
          <span>Vincular receta</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl flex flex-col h-[520px] max-h-[85vh] overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Vincular receta</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RecipePicker onSelect={handleSelect} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
