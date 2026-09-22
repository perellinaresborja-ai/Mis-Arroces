"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { formatUnitSymbol } from "@/lib/utils"

function getBaseUnitForIngredient(ingUnitId: string, catalogs: any) {
  const ingUnit = catalogs.units.find((u: any) => u.id === ingUnitId);
  if (!ingUnit) return { id: ingUnitId, label: 'unidad' };
  const name = ingUnit.name.toLowerCase();
  
  if (["g", "gr", "gramo", "gramos", "kg", "kilo", "kilos"].includes(name)) {
    const kgUnit = catalogs.units.find((u: any) => u.name.toLowerCase() === "kg");
    return { id: kgUnit?.id || ingUnitId, label: 'kg' };
  }
  if (["ml", "mililitro", "mililitros", "l", "litro", "litros", "cl", "dl"].includes(name)) {
    const lUnit = catalogs.units.find((u: any) => u.name.toLowerCase() === "l");
    return { id: lUnit?.id || ingUnitId, label: 'L' };
  }
  
  return { id: ingUnitId, label: formatUnitSymbol(ingUnit.name) };
}

export function EscandalloSection({ recipeId, initialIngredients, catalogs, baseServings, setValue }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [costs, setCosts] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && costs.length === 0) {
      // Load costs
      supabase.from("recipe_ingredient_costs").select("*").eq("recipe_id", recipeId).then(async ({ data }) => {
        if (data && data.length > 0) {
          setCosts(data)
        } else {
          // Si no hay datos en BD para esta receta, intentamos cargar de los precios reutilizables del usuario en Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const localCosts = [...costs];
          let updated = false;

          const { data: userPrices } = await supabase.from("user_ingredient_prices").select("*").eq("user_id", user.id);
          if (userPrices && userPrices.length > 0) {
            initialIngredients.forEach((ing: any) => {
              // Buscar primero por canonical, luego por nombre
              let match = ing.canonical_ingredient_id 
                ? userPrices.find(up => up.canonical_ingredient_id === ing.canonical_ingredient_id)
                : userPrices.find(up => up.raw_name?.toLowerCase() === ing.display_text?.toLowerCase());
                
              if (match) {
                localCosts.push({
                  id: (ing.db_id || ing.id),
                  recipe_id: recipeId,
                  purchase_amount: 1,
                  purchase_unit_id: match.purchase_unit_id,
                  purchase_price: match.purchase_price
                });
                updated = true;
              }
            });
            if (updated) setCosts(localCosts);
          }
        }
      })
    }
  }, [isOpen, recipeId, costs.length, supabase, initialIngredients])

  const handleSaveCost = async (ing: any, purchaseUnitId: string, purchasePrice: number) => {
    const ingId = ing.db_id || ing.id;
    const purchaseAmount = 1; // Siempre referenciamos 1 unidad base (ej: 1 kg, 1 L)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Guardar precio global para el usuario en Supabase (reemplaza localStorage)
    const upsertData: any = {
      user_id: user.id,
      purchase_price: purchasePrice,
      purchase_unit_id: purchaseUnitId,
      updated_at: new Date().toISOString()
    };
    if (ing.canonical_ingredient_id) {
       upsertData.canonical_ingredient_id = ing.canonical_ingredient_id;
    } else {
       upsertData.raw_name = ing.display_text;
    }
    const { error: userPriceErr } = await supabase.from("user_ingredient_prices").upsert(upsertData, {
      onConflict: ing.canonical_ingredient_id ? 'user_id,canonical_ingredient_id' : 'user_id,raw_name'
    });
    if (userPriceErr) console.error("Error saving global user price:", userPriceErr);

    // Optimistic update
    const newCosts = [...costs]
    const idx = newCosts.findIndex(c => c.id === ingId)
    // Also save to form state
    const fieldIdx = initialIngredients.findIndex((i: any) => (i.db_id || i.id) === ingId)
    if (fieldIdx >= 0 && setValue) {
      setValue(`ingredients.${fieldIdx}.costData`, { purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice })
    }
    if (idx >= 0) {
      newCosts[idx] = { id: ingId, recipe_id: recipeId, purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice }
    } else {
      newCosts.push({ id: ingId, recipe_id: recipeId, purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice })
    }
    setCosts(newCosts)

    if (!ing.is_virtual) {
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
        <h2 className="font-semibold text-lg flex items-center gap-2">Coste de la receta</h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground bg-blue-500/10 text-blue-500 p-3 rounded-xl border border-blue-500/20">
            Este escandallo es totalmente privado y no será visible para otros usuarios en la receta pública. Los precios se guardarán automáticamente para facilitarte futuras recetas.
          </p>
          
          <div className="space-y-4">
            {initialIngredients.map((ing: any) => {
              const costRow = costs.find(c => c.id === (ing.db_id || ing.id))
              const usedUnit = catalogs.units.find((u: any) => u.id === ing.unit_id)
              const baseUnit = getBaseUnitForIngredient(ing.unit_id, catalogs)
              
              // Calculate specific cost for this ingredient
              let partialCost = 0;
              if (costRow && costRow.purchase_price && costRow.purchase_amount) {
                const purchaseUnit = catalogs.units.find((u: any) => u.id === costRow.purchase_unit_id)
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
                    convertedPurchaseAmount = -1
                  }
                }
                if (convertedPurchaseAmount > 0) {
                  partialCost = (Number(costRow.purchase_price) / convertedPurchaseAmount) * usedAmount
                }
              }

              return (
                <div key={ing.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center bg-muted/20 p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-medium line-clamp-1">{ing.display_text}</p>
                    <p className="text-xs text-muted-foreground">Uso: {ing.normalized_quantity} {formatUnitSymbol(usedUnit?.name)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap text-muted-foreground">Precio por {baseUnit.label}:</Label>
                    <div className="relative w-24">
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="Ej: 5.50"
                        defaultValue={costRow?.purchase_price}
                        className="pr-6"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleSaveCost(ing, baseUnit.id, Number(e.target.value))
                          }
                        }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                    </div>
                  </div>

                  <div className="text-right w-16">
                    <p className="font-bold text-sm text-foreground">{partialCost > 0 ? partialCost.toFixed(2) : "0.00"} €</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 mt-6">
            <div className="flex justify-between font-medium">
              <span>Coste total receta:</span>
              <span>{totalCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>Raciones:</span>
              <span>{baseServings}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/10">
              <span>Coste por ración:</span>
              <span>{baseServings > 0 ? (totalCost / baseServings).toFixed(2) : "0.00"} €</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
