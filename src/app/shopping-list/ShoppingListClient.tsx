"use client"
import { formatUnitSymbol } from "@/lib/utils"

import { useState } from "react"
import { Check, Trash2 } from "lucide-react"
import { toggleShoppingItem, removeShoppingItem, clearCheckedShoppingItems, clearShoppingList } from "@/app/actions/shopping"
import { Button } from "@/components/ui/button"

export function ShoppingListClient({ listId, initialItems }: { listId: string, initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)

  const handleToggle = async (id: string, current: boolean) => {
    // Optimistic
    setItems(items.map(item => item.id === id ? { ...item, is_checked: !current } : item))
    await toggleShoppingItem(id, !current)
  }

  const handleRemove = async (id: string) => {
    setItems(items.filter(item => item.id !== id))
    await removeShoppingItem(id)
  }

  const handleClearChecked = async () => {
    setItems(items.filter(item => !item.is_checked))
    await clearCheckedShoppingItems(listId)
  }

  const handleClearAll = async () => {
    setItems([])
    await clearShoppingList(listId)
  }

  const pending = items.filter(i => !i.is_checked).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const checked = items.filter(i => i.is_checked).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const formatQuantity = (qty: number | null, unitName: string | null) => {
    if (!qty) return ""
    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\.00$/, "")
    return `${formattedQty} ${formatUnitSymbol(unitName)}`.trim()
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {pending.length === 0 && checked.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Lista vacía.</div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {pending.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                <button 
                  onClick={() => handleToggle(item.id, false)}
                  className="w-6 h-6 rounded border-2 border-primary flex items-center justify-center shrink-0"
                >
                  <span className="sr-only">Marcar</span>
                </button>
                <div className="flex-1 flex justify-between items-center min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.ingredient_name}</span>
                    {item.recipe?.name && <span className="text-xs text-muted-foreground truncate">de {item.recipe.name}</span>}
                  </div>
                  <span className="font-bold whitespace-nowrap ml-2 text-sm">
                    {formatQuantity(item.quantity, item.unit?.name)}
                  </span>
                </div>
                <button onClick={() => handleRemove(item.id)} className="p-2 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {checked.length > 0 && (
              <div className="bg-muted/20">
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground bg-muted/40 uppercase tracking-wider">
                  Comprados
                </div>
                {checked.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-4 opacity-50 hover:opacity-75 transition-opacity">
                    <button 
                      onClick={() => handleToggle(item.id, true)}
                      className="w-6 h-6 rounded border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span className="font-medium truncate line-through">{item.ingredient_name}</span>
                      <span className="font-bold whitespace-nowrap ml-2 text-sm line-through">
                        {formatQuantity(item.quantity, item.unit?.name)}
                      </span>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="p-2 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(pending.length > 0 || checked.length > 0) && (
        <div className="flex gap-2 justify-end">
          {checked.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearChecked} className="rounded-full text-xs">
              Eliminar comprados
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="rounded-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
            Vaciar lista
          </Button>
        </div>
      )}
    </div>
  )
}
