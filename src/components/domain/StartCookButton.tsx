"use client"

import Link from "next/link"
import { useRecipeState } from "./RecipeStateProvider"
import { Play, AlertCircle, Pencil } from "lucide-react"
import { sendGAEvent } from "@/lib/analytics/ga4"

interface StartCookButtonProps {
  recipeId: string;
  isCookable?: boolean;
  cookableReason?: string;
  isOwner?: boolean;
}

export function StartCookButton({
  recipeId,
  isCookable = true,
  cookableReason,
  isOwner = false
}: StartCookButtonProps) {
  const { servings } = useRecipeState()

  const handleStartCook = () => {
    sendGAEvent("start_cooking", { recipe_id: recipeId })
  }

  if (!isCookable) {
    return (
      <div className="w-full mt-6 bg-muted/60 border border-border p-5 rounded-3xl text-center space-y-3 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-muted-foreground font-semibold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{cookableReason || "Esta receta todavía no tiene la elaboración completa."}</span>
        </div>
        {isOwner ? (
          <Link
            href={`/recipes/${recipeId}/edit`}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white text-sm shadow-sm transition-all active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            Completar receta
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">
            El autor aún no ha añadido los pasos para poder cocinarla en Modo Cocina.
          </p>
        )}
      </div>
    )
  }

  return (
    <Link 
      href={`/recipes/${recipeId}/mode?servings=${servings}&reset=true`}
      onClick={handleStartCook}
      className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-3xl flex items-center justify-center gap-2 text-xl shadow-xl transition-transform active:scale-95 border border-primary/20"
    >
      <Play className="w-7 h-7 fill-current" />
      EMPEZAR A COCINAR
    </Link>
  )
}
