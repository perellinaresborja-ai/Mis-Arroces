"use client"

import { useState } from "react"
import { addRecipeToShoppingList } from "@/app/actions/shopping"
import { ShoppingCart, Check, ListChecks } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddToCartButton({ recipeId, isAuthenticated, layout = "vertical" }: { recipeId: string, isAuthenticated: boolean, layout?: "horizontal" | "vertical" }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/recipes/${recipeId}`)
      return
    }
    
    setLoading(true)
    try {
      await addRecipeToShoppingList(recipeId)
      setAdded(true)
      setTimeout(() => setAdded(false), 3000) // Reset after 3s
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`mt-6 flex gap-3 w-full ${layout === "horizontal" ? "flex-row" : "flex-col max-w-[380px]"}`}>
      <button 
        onClick={handleAdd}
        disabled={loading || added}
        className={`flex items-center justify-center gap-2 py-3 bg-card border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors disabled:opacity-50 text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-2" : "w-full"}`}
      >
        {added ? (
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
          className="flex items-center justify-center gap-2 w-full py-3 bg-muted/30 border border-border text-foreground font-semibold rounded-2xl hover:bg-muted/50 transition-colors"
        >
          <ListChecks className="w-5 h-5 text-muted-foreground" /> Ver mi lista de compra
        </button>
      )}
    </div>
  )
}
