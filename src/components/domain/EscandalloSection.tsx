"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp, Calculator } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { formatUnitSymbol } from "@/lib/utils"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getBaseUnitForIngredient(ingUnitId: string, catalogs: any) {
  const ingUnit = catalogs?.units?.find((u: any) => u.id === ingUnitId);
  if (!ingUnit) return { id: ingUnitId || "", label: 'unidad' };
  const name = ingUnit.name?.toLowerCase() || "";
  
  if (["g", "gr", "gramo", "gramos", "kg", "kilo", "kilos"].includes(name)) {
    const kgUnit = catalogs.units?.find((u: any) => u.name?.toLowerCase() === "kg");
    return { id: kgUnit?.id || ingUnitId, label: 'kg' };
  }
  if (["ml", "mililitro", "mililitros", "l", "litro", "litros", "cl", "dl"].includes(name)) {
    const lUnit = catalogs.units?.find((u: any) => u.name?.toLowerCase() === "l");
    return { id: lUnit?.id || ingUnitId, label: 'L' };
  }
  
  return { id: ingUnitId, label: formatUnitSymbol(ingUnit.name) || 'unidad' };
}

function calculatePartialCost(costRow: any, ing: any, catalogs: any): number {
  if (!costRow || !costRow.purchase_price || isNaN(Number(costRow.purchase_price))) return 0;
  
  const purchasePrice = Number(costRow.purchase_price);
  if (purchasePrice <= 0) return 0;

  const usedQty = Number(ing.normalized_quantity);
  if (isNaN(usedQty) || usedQty <= 0) return 0;

  const purchaseUnit = catalogs?.units?.find((u: any) => u.id === costRow.purchase_unit_id);
  const usedUnit = catalogs?.units?.find((u: any) => u.id === ing.unit_id);

  let convertedPurchaseAmount = Number(costRow.purchase_amount) || 1;

  if (purchaseUnit && usedUnit) {
    const pu = purchaseUnit.name?.toLowerCase() || "";
    const uu = usedUnit.name?.toLowerCase() || "";

    if ((pu === 'kg' && uu === 'g') || (pu === 'l' && uu === 'ml')) {
      convertedPurchaseAmount *= 1000;
    } else if ((pu === 'g' && uu === 'kg') || (pu === 'ml' && uu === 'l')) {
      convertedPurchaseAmount /= 1000;
    } else if (pu === 'l' && uu === 'cl') {
      convertedPurchaseAmount *= 100;
    } else if (pu === 'l' && uu === 'dl') {
      convertedPurchaseAmount *= 10;
    } else if (pu !== uu) {
      // Incompatible units, fallback direct unit multiplication
      convertedPurchaseAmount = 1;
    }
  }

  if (convertedPurchaseAmount <= 0) return 0;
  return (purchasePrice / convertedPurchaseAmount) * usedQty;
}

export function EscandalloSection({ recipeId, initialIngredients, catalogs, baseServings, setValue }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [costs, setCosts] = useState<any[]>([])

  const supabase = createClient()

  // Load existing costs for this recipe only (manual escandallo, no global prices)
  useEffect(() => {
    if (isOpen && costs.length === 0 && recipeId && UUID_REGEX.test(recipeId)) {
      supabase
        .from("recipe_ingredient_costs")
        .select("*")
        .eq("recipe_id", recipeId)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setCosts(data);
          }
        });
    }
  }, [isOpen, recipeId, costs.length, supabase]);

  const handleSaveCost = async (ing: any, purchaseUnitId: string, purchasePrice: number | string) => {
    const ingId = ing.db_id || ing.id;
    const priceNum = purchasePrice === "" ? null : Number(purchasePrice);
    const purchaseAmount = 1; // 1 unidad base (ej: 1 kg, 1 L, 1 ud)
    
    // Update local component state for instant calculation
    const newCosts = [...costs];
    const idx = newCosts.findIndex(c => c.id === ingId);
    const costEntry = {
      id: ingId,
      recipe_id: recipeId,
      purchase_amount: purchaseAmount,
      purchase_unit_id: purchaseUnitId || null,
      purchase_price: priceNum
    };

    if (idx >= 0) {
      newCosts[idx] = costEntry;
    } else {
      newCosts.push(costEntry);
    }
    setCosts(newCosts);

    // Save to form state so it gets saved on submit if needed
    if (setValue && !ing.is_virtual) {
      const fieldIdx = initialIngredients.findIndex((i: any) => (i.db_id || i.id) === ingId);
      if (fieldIdx >= 0) {
        setValue(`ingredients.${fieldIdx}.costData`, {
          purchase_amount: purchaseAmount,
          purchase_unit_id: purchaseUnitId || null,
          purchase_price: priceNum
        });
      }
    }

    // Persist immediately to recipe_ingredient_costs if it's a real ingredient with valid UUID
    if (!ing.is_virtual && ingId && UUID_REGEX.test(ingId) && recipeId && UUID_REGEX.test(recipeId)) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (priceNum !== null && priceNum > 0) {
          await supabase.from("recipe_ingredient_costs").upsert({
            id: ingId,
            recipe_id: recipeId,
            owner_id: user.id,
            purchase_amount: purchaseAmount,
            purchase_unit_id: purchaseUnitId || null,
            purchase_price: priceNum
          });
        } else {
          // If price cleared to 0 or empty, delete row
          await supabase.from("recipe_ingredient_costs").delete().eq("id", ingId);
        }
      }
    }
  };

  // Calculate totals purely from current manual inputs
  const totalCost = useMemo(() => {
    let sum = 0;
    (initialIngredients || []).forEach((ing: any) => {
      const costRow = costs.find(c => c.id === (ing.db_id || ing.id));
      sum += calculatePartialCost(costRow, ing, catalogs);
    });
    return sum;
  }, [initialIngredients, costs, catalogs]);

  const servingsCount = Math.max(1, Number(baseServings) || 1);
  const costPerServing = totalCost > 0 ? totalCost / servingsCount : 0;

  return (
    <section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">
      <div 
        className="flex justify-between items-center cursor-pointer select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Coste de la receta (Escandallo)</h2>
        </div>
        <div className="flex items-center gap-3">
          {totalCost > 0 && !isOpen && (
            <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {totalCost.toFixed(2)} € ({costPerServing.toFixed(2)} €/ración)
            </span>
          )}
          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
            Introduce el precio actual de cada ingrediente. El escandallo es manual y privado: misarroces calculará automáticamente el coste de cada ingrediente, el total y el coste por ración.
          </p>
          
          <div className="space-y-3">
            {(initialIngredients || []).map((ing: any) => {
              const ingKey = ing.db_id || ing.id;
              const costRow = costs.find(c => c.id === ingKey);
              const usedUnit = catalogs?.units?.find((u: any) => u.id === ing.unit_id);
              const baseUnit = getBaseUnitForIngredient(ing.unit_id, catalogs);
              const partialCost = calculatePartialCost(costRow, ing, catalogs);

              return (
                <div 
                  key={ingKey} 
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center bg-muted/30 p-3 md:p-4 rounded-xl border border-border"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate text-foreground">{ing.display_text}</p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {ing.normalized_quantity || "-"} {formatUnitSymbol(usedUnit?.name) || ""}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap text-muted-foreground">
                      Precio /{baseUnit.label}:
                    </Label>
                    <div className="relative w-28">
                      <Input 
                        type="number" 
                        step="any"
                        min="0"
                        placeholder="0.00"
                        defaultValue={costRow?.purchase_price ?? ""}
                        className="pr-6 h-9 text-sm bg-background"
                        onChange={(e) => {
                          handleSaveCost(ing, baseUnit.id, e.target.value);
                        }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">
                        €
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:w-20">
                    <p className="font-bold text-sm text-foreground">
                      {partialCost > 0 ? partialCost.toFixed(2) : "0.00"} €
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 mt-6">
            <div className="flex justify-between font-medium text-sm">
              <span className="text-muted-foreground">Coste total de la receta:</span>
              <span className="font-bold text-foreground">{totalCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>Número de raciones:</span>
              <span className="font-medium text-foreground">{servingsCount}</span>
            </div>
            <div className="flex justify-between font-bold text-base md:text-lg pt-2 border-t border-primary/10">
              <span className="text-primary">Coste por ración:</span>
              <span className="text-primary">{costPerServing.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
