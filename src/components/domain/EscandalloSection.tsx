"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function EscandalloSection({ recipeId, initialIngredients, catalogs, baseServings }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [costs, setCosts] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && costs.length === 0) {
      // Load costs
      supabase.from("recipe_ingredient_costs").select("*").eq("recipe_id", recipeId).then(({ data }) => {
        if (data) {
          setCosts(data)
        }
      })
    }
  }, [isOpen, recipeId, costs.length, supabase])

  const handleSaveCost = async (ingId: string, purchaseAmount: number, purchaseUnitId: string, purchasePrice: number) => {
    // Optimistic update
    const newCosts = [...costs]
    const idx = newCosts.findIndex(c => c.id === ingId)
    if (idx >= 0) {
      newCosts[idx] = { id: ingId, recipe_id: recipeId, purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice }
    } else {
      newCosts.push({ id: ingId, recipe_id: recipeId, purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice })
    }
    setCosts(newCosts)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("recipe_ingredient_costs").upsert({
      id: ingId,
      recipe_id: recipeId,
      owner_id: user.id,
      purchase_amount: purchaseAmount,
      purchase_unit_id: purchaseUnitId,
      purchase_price: purchasePrice
    });
    if (error) console.error("Error saving cost:", error)
  }

  // Calculate totals
  const totalCost = useMemo(() => {
    let sum = 0
    initialIngredients.forEach((ing: any) => {
      const costRow = costs.find(c => c.id === (ing.db_id || ing.id))
      if (costRow && costRow.purchase_price && costRow.purchase_amount) {
        // Find units
        const purchaseUnit = catalogs.units.find((u: any) => u.id === costRow.purchase_unit_id)
        const usedUnit = catalogs.units.find((u: any) => u.id === ing.unit_id)

        // Conversion logic
        let convertedPurchaseAmount = Number(costRow.purchase_amount)
        let usedAmount = Number(ing.normalized_quantity)

        if (purchaseUnit && usedUnit) {
          const pu = purchaseUnit.name.toLowerCase()
          const uu = usedUnit.name.toLowerCase()
          if ((pu === 'kg' && uu === 'g') || (pu === 'l' && uu === 'ml')) {
            convertedPurchaseAmount *= 1000
          } else if ((pu === 'g' && uu === 'kg') || (pu === 'ml' && uu === 'l')) {
            convertedPurchaseAmount /= 1000
          } else if (pu !== uu) {
            // Incompatible, skip
            convertedPurchaseAmount = -1
          }
        }

        if (convertedPurchaseAmount > 0) {
          sum += (Number(costRow.purchase_price) / convertedPurchaseAmount) * usedAmount
        }
      }
    })
    return sum
  }, [initialIngredients, costs, catalogs])

  return (
    <section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="font-semibold text-lg flex items-center gap-2">Calcular escandallo <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-normal">Opcional</span></h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground bg-blue-500/10 text-blue-500 p-3 rounded-xl border border-blue-500/20">Este escandallo es totalmente privado y no será visible para otros usuarios en la receta pública.</p>
          
          <div className="space-y-4">
            {initialIngredients.map((ing: any) => {
              const costRow = costs.find(c => c.id === (ing.db_id || ing.id))
              const usedUnit = catalogs.units.find((u: any) => u.id === ing.unit_id)
              
              return (
                <div key={ing.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-muted/20 p-4 rounded-xl border border-border">
                  <div className="md:col-span-4">
                    <p className="font-medium">{ing.display_text}</p>
                    <p className="text-xs text-muted-foreground">Cantidad usada: {ing.normalized_quantity} {usedUnit?.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Compra</Label>
                    <Input 
                      type="number" 
                      step="any"
                      placeholder="Ej: 2"
                      defaultValue={costRow?.purchase_amount}
                      onBlur={(e) => handleSaveCost((ing.db_id || ing.id), Number(e.target.value), costRow?.purchase_unit_id || ing.unit_id, costRow?.purchase_price || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unidad</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      defaultValue={costRow?.purchase_unit_id || ing.unit_id}
                      onChange={(e) => handleSaveCost((ing.db_id || ing.id), costRow?.purchase_amount || 0, e.target.value, costRow?.purchase_price || 0)}
                    >
                      {catalogs.units.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Precio (€)</Label>
                    <Input 
                      type="number" 
                      step="any"
                      placeholder="Ej: 5.50"
                      defaultValue={costRow?.purchase_price}
                      onBlur={(e) => handleSaveCost((ing.db_id || ing.id), costRow?.purchase_amount || 0, costRow?.purchase_unit_id || ing.unit_id, Number(e.target.value))}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 mt-6">
            <div className="flex justify-between font-medium">
              <span>Coste ingredientes:</span>
              <span>{totalCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>Personas:</span>
              <span>{baseServings}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/10">
              <span>Coste/persona:</span>
              <span>{baseServings > 0 ? (totalCost / baseServings).toFixed(2) : "0.00"} €</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
