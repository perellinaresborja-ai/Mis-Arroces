"use client"

import { useState } from "react"
import { addRecipeToShoppingList } from "@/app/actions/shopping"
import { ShoppingCart, Check, ListChecks } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddToCartButton({ recipeId, isAuthenticated, layout = "vertical", baseServings = null }: { recipeId: string, isAuthenticated: boolean, layout?: "horizontal" | "vertical" | "icon", baseServings?: number | null }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInitialClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/recipes/${recipeId}`)
      return
    }
    handleAdd(baseServings || undefined)
  }

  const handleAdd = async (servings?: number) => {
    setLoading(true)
    try {
      await addRecipeToShoppingList(recipeId, servings)
      setAdded(true)
      setTimeout(() => setAdded(false), 3000) // Reset after 3s
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (layout === "icon") {
    return (
      <button 
        onClick={handleInitialClick} 
        disabled={loading || added} 
        className="p-1.5 md:p-2 rounded-full hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
        title="Añadir a mi compra"
        type="button"
      >
        {added ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className={`w-4 h-4 md:w-5 md:h-5 ${loading ? "animate-pulse" : ""}`} />}
      </button>
    )
  }

  return (
    <div className={`mt-6 flex gap-3 w-full ${layout === "horizontal" ? "flex-row flex-wrap" : "flex-col max-w-[380px]"}`}>
      <button 
        onClick={handleInitialClick}
        disabled={loading || added}
        className={`flex items-center justify-center gap-2 py-2 bg-card border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors disabled:opacity-50 text-xs sm:text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-1 sm:px-2 whitespace-nowrap" : "w-full"}`}
      >
        {loading ? (
          <>
            <ShoppingCart className="w-5 h-5 animate-pulse" /> Añadiendo a mi compra...
          </>
        ) : added ? (
          <>
            <Check className="w-5 h-5" /> Añadido a mi compra
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" /> Añadir ingredientes a mi compra
          </>
        )}
      </button>
      
      {isAuthenticated && (
        <button
          onClick={() => router.push('/shopping-list')}
          className={`flex items-center justify-center gap-2 py-2 bg-muted/30 border border-border text-foreground font-semibold rounded-2xl hover:bg-muted/50 transition-colors text-xs sm:text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-1 sm:px-2 whitespace-nowrap" : "w-full"}`}
        >
          <ListChecks className="w-5 h-5 text-muted-foreground" /> Ver mi lista de compra
        </button>
      )}
    </div>
  )
}
