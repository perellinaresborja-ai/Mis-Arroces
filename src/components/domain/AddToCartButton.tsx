"use client"

import { useState } from "react"
import { addRecipeToShoppingList } from "@/app/actions/shopping"
import { ShoppingCart, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddToCartButton({ recipeId, isAuthenticated }: { recipeId: string, isAuthenticated: boolean }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/recipes/\${recipeId}`)
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
    <button 
      onClick={handleAdd}
      disabled={loading || added}
      className="mt-6 flex items-center justify-center gap-2 w-full max-w-[380px] py-3 bg-card border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors disabled:opacity-50"
    >
      {added ? (
        <>
          <Check className="w-5 h-5" /> Añadido a mi compra
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" /> Añadir a mi compra
        </>
      )}
    </button>
  )
}
