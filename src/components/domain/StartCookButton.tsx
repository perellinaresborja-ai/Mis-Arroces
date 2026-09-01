"use client"

import Link from "next/link"
import { useRecipeState } from "./RecipeStateProvider"
import { Play } from "lucide-react"

export function StartCookButton({ recipeId }: { recipeId: string }) {
  const { servings } = useRecipeState()

  return (
    <Link 
      href={`/recipes/${recipeId}/mode?servings=${servings}`}
      className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-3xl flex items-center justify-center gap-2 text-xl shadow-xl transition-transform active:scale-95 border border-primary/20"
    >
      <Play className="w-7 h-7 fill-current" />
      EMPEZAR A COCINAR
    </Link>
  )
}
