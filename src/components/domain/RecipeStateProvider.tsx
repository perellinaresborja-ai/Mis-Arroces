"use client"

import { createContext, useContext, useState } from "react"

interface RecipeState {
  servings: number
  setServings: (n: number) => void
}

const RecipeStateContext = createContext<RecipeState | null>(null)

export function RecipeStateProvider({ children, baseServings }: { children: React.ReactNode, baseServings: number }) {
  const [servings, setServings] = useState(baseServings)
  return (
    <RecipeStateContext.Provider value={{ servings, setServings }}>
      {children}
    </RecipeStateContext.Provider>
  )
}

export function useRecipeState() {
  const ctx = useContext(RecipeStateContext)
  if (!ctx) throw new Error("useRecipeState must be used within RecipeStateProvider")
  return ctx
}
