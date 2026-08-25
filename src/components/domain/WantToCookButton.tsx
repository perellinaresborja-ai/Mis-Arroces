"use client"

import { useState } from "react"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleWantToCook } from "@/app/actions/recipes"

export function WantToCookButton({ recipeId, initialSaved }: { recipeId: string, initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const nextState = !saved
    setSaved(nextState)
    try {
      await toggleWantToCook(recipeId, nextState)
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
      <ChefHat className="w-4 h-4 mr-2" />
      {saved ? "Quiero cocinarlo" : "Quiero cocinarlo"}
    </Button>
  )
}
