"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUnitSymbol } from "@/lib/utils";
import { Users, Droplet, Scaling, Info, Circle } from "lucide-react";
import { 
  calculateLayer, 
  calculateRealBrothRatio,
  LayerType
} from "@/lib/paella-calculator";
import { AddToCartButton } from "@/components/domain/AddToCartButton";
import { useRecipeState } from "@/components/domain/RecipeStateProvider";
import { getUnifiedIngredients } from "@/lib/recipe-ingredients-derived";

export function InteractiveRecipeView({ 
  recipe, 
  isAuthenticated,
  children
}: { 
  recipe: any;
  isAuthenticated: boolean;
  children?: React.ReactNode;
}) {
  const { servings, setServings } = useRecipeState();
  const scaleRatio = servings / (recipe.base_servings || 1);
  const vessel = recipe.recipe_vessels?.[0];
  
  // Base values from recipe (SSOT + Fallback)
  const { finalRiceQty: baseRiceGrams, finalStockQty: baseBrothGrams, unifiedList } = getUnifiedIngredients(recipe);

  // Scaled values
  const currentRiceGrams = baseRiceGrams ? baseRiceGrams * scaleRatio : null;
  const currentBrothGrams = baseBrothGrams ? baseBrothGrams * scaleRatio : null;
  const diameterCm = vessel?.diameter_cm;
  
  const layer = (currentRiceGrams && diameterCm) ? calculateLayer(currentRiceGrams, diameterCm) : null;
  const brothRatio = (currentRiceGrams && currentBrothGrams) ? calculateRealBrothRatio(currentRiceGrams, currentBrothGrams) : null;

  const layerColors: Record<LayerType, string> = {
    'Fina': 'text-green-600',
    'Media': 'text-amber-600',
    'Abundante': 'text-orange-600'
  };

  const ingredients = unifiedList.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
  const safeNumber = (num: number | null) => (num !== null && isFinite(num) && !isNaN(num)) ? Math.round(num).toString() : "0";

  return (
    <div className="w-full">
      {/* Top Header - Solo Ingredientes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-muted/40 p-4 rounded-2xl border border-border sm:h-[82px]">
          <h2 className="text-xl md:text-2xl font-bold font-serif text-charcoal">Ingredientes</h2>
        </div>
  
        {/* Ingredients List */}
        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-6 overflow-hidden shadow-sm">
          <ul className="space-y-1">
            {ingredients.map((ing: any) => {
              const scaledQty = ing.normalized_quantity ? (ing.normalized_quantity * scaleRatio) : null;
              return (
                <li key={ing.id} className="flex justify-between items-center text-[15px] py-3 border-b border-border/40 last:border-0">
                  <span className="text-foreground/90 pr-4">{ing.display_text}</span>
                  {scaledQty !== null && (
                    <span className="font-bold text-charcoal shrink-0 bg-muted/50 px-3 py-1.5 rounded-lg text-sm border border-border/50">
                      {+(scaledQty.toFixed(2))} {formatUnitSymbol(ing.unit?.name)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Scaler (Moved below list) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-muted/40 p-4 rounded-2xl border border-border sm:h-[82px]">
          <h2 className="text-lg md:text-xl font-bold font-serif text-charcoal">¿Para cuántos vas a cocinar?</h2>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">-</button>
            <span className="font-bold text-lg w-6 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">+</button>
          </div>
        </div>

      <div className="flex flex-col gap-3">
        <AddToCartButton recipeId={recipe.id} isAuthenticated={isAuthenticated} baseServings={servings} layout="horizontal" />
      </div>
      
      <div className="mt-8 w-full">
        {children}
      </div>
    </div>
  );
}
