"use client"

import { useState } from "react"
import { addRecipeToShoppingList } from "@/app/actions/shopping"
import { ShoppingCart, Check, ListChecks, Users, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddToCartButton({ recipeId, isAuthenticated, layout = "vertical", baseServings = null }: { recipeId: string, isAuthenticated: boolean, layout?: "horizontal" | "vertical" | "icon", baseServings?: number | null }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [targetServings, setTargetServings] = useState(baseServings || 4)
  const router = useRouter()

  const handleInitialClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/recipes/${recipeId}`)
      return
    }
    if (layout === "icon" || !baseServings) {
      handleAdd(baseServings || undefined)
    } else {
      setIsSelecting(true)
    }
  }

  const handleAdd = async (servings?: number) => {
    setLoading(true)
    try {
      await addRecipeToShoppingList(recipeId, servings)
      setAdded(true)
      setIsSelecting(false)
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
        {added ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
      </button>
    )
  }

  return (
    <div className={`mt-6 flex gap-3 w-full ${layout === "horizontal" ? "flex-col sm:flex-row" : "flex-col max-w-[380px]"}`}>
      {isSelecting ? (
        <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-2xl animate-in zoom-in-95 duration-200">
          <span className="text-sm font-semibold text-center text-muted-foreground flex items-center justify-center gap-1.5"><Users className="w-4 h-4"/> ¿Para cuántas personas comprar?</span>
          <div className="flex items-center justify-between my-2">
            <button onClick={() => setTargetServings(Math.max(1, targetServings - 1))} className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"><Minus className="w-5 h-5"/></button>
            <span className="font-bold text-xl w-12 text-center">{targetServings}</span>
            <button onClick={() => setTargetServings(targetServings + 1)} className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"><Plus className="w-5 h-5"/></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSelecting(false)} className="flex-1 py-2 bg-muted/50 text-foreground text-sm font-semibold rounded-xl hover:bg-muted/70 transition-colors">Cancelar</button>
            <button onClick={() => handleAdd(targetServings)} disabled={loading} className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
              {loading ? "Calculando..." : "Confirmar"}
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleInitialClick}
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
      )}
      
      {isAuthenticated && !isSelecting && (
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
