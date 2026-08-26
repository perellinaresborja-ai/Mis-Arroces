"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleSaveRecipe } from "@/app/actions/recipes"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

export function SaveRecipeButton({ recipeId, initialSaved, isAuthenticated }: { recipeId: string, initialSaved: boolean, isAuthenticated: boolean }) {
  const [saved, setSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const { showAuthPrompt } = useAuthPrompt()

  const handleToggle = async () => {
    if (!isAuthenticated) {
      showAuthPrompt("Crea tu cuenta para guardar esta receta.")
      return
    }
    setIsLoading(true)
    const nextState = !saved
    setSaved(nextState)
    try {
      await toggleSaveRecipe(recipeId, nextState)
    } catch (error) {
      setSaved(!nextState)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant={saved ? "default" : "outline"}
      size="sm"
      className="rounded-full shadow-sm font-bold"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {saved ? (
        <><BookmarkCheck className="w-4 h-4 mr-2" /> Guardado</>
      ) : (
        <><Bookmark className="w-4 h-4 mr-2" /> Guardar receta</>
      )}
    </Button>
  )
}
