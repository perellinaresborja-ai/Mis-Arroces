"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUnitSymbol } from "@/lib/utils";
import { Users, Droplet, Scaling, Info, Circle } from "lucide-react";
import { 
  extractRealRiceGrams, 
  extractRealBrothGrams, 
  calculateLayer, 
  calculateRealBrothRatio,
  LayerType
} from "@/lib/paella-calculator";
import { AddToCartButton } from "@/components/domain/AddToCartButton";
import { useRecipeState } from "@/components/domain/RecipeStateProvider";

export function InteractiveRecipeView({ 
  recipe, 
  isAuthenticated,
  children
}: { 
  recipe: any, 
  isAuthenticated: boolean,
  children?: React.ReactNode
}) {
  const { servings, setServings } = useRecipeState();
  const scaleRatio = servings / (recipe.base_servings || 1);
  const vessel = recipe.recipe_vessels?.[0];
  
  // Base values from recipe
  const baseRiceGrams = extractRealRiceGrams(recipe.ingredients);
  const baseBrothGrams = extractRealBrothGrams(recipe.ingredients);

  // Scaled values
  const currentRiceGrams = baseRiceGrams ? baseRiceGrams * scaleRatio : null;
  const currentBrothGrams = baseBrothGrams ? baseBrothGrams * scaleRatio : null;
  const diameterCm = vessel?.diameter_cm;
  
  const layer = (currentRiceGrams && diameterCm) ? calculateLayer(currentRiceGrams, diameterCm) : null;
  const brothRatio = (currentRiceGrams && currentBrothGrams) ? calculateRealBrothRatio(currentRiceGrams, currentBrothGrams) : null;

  const layerColors: Record<LayerType, string> = {
    'Fina': 'text-green-600',
    'Media': 'text-blue-600',
    'Abundante': 'text-orange-600'
  };

  const ingredients = [...(recipe.ingredients || [])].sort((a: any, b: any) => a.display_order - b.display_order);
  const safeNumber = (num: number | null) => (num !== null && isFinite(num) && !isNaN(num)) ? Math.round(num).toString() : "0";

  return (
    <div className="w-full">
      {/* Scaler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-muted/40 p-4 rounded-2xl border border-border sm:h-[82px]">
        <h2 className="text-xl font-bold font-serif text-charcoal">Ingredientes</h2>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">-</button>
          <span className="font-bold text-lg w-6 text-center">{servings}</span>
          <button onClick={() => setServings(servings + 1)} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">+</button>
        </div>
      </div>

      {/* Paella Calculator Simple Summary */}
      {(diameterCm || currentRiceGrams) && (
        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-3 p-4 md:p-5 bg-card border border-border rounded-2xl shadow-sm text-sm">
          <div className="w-full mb-1 flex items-center gap-2 text-primary font-bold">
            <Scaling className="w-4 h-4" /> Paella y CocciÃ³n
          </div>
          {diameterCm && (
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-muted-foreground" /> 
              <span className="font-bold">{diameterCm} cm</span>
            </div>
          )}
          {currentRiceGrams && (
            <div className="flex items-center gap-2">
              <span className="font-bold">{safeNumber(currentRiceGrams)}g</span> arroz
              <span className="text-muted-foreground text-xs">({safeNumber(currentRiceGrams / servings)}g/pers)</span>
            </div>
          )}
          {layer && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Capa:</span>
              <span className={`font-bold ${layerColors[layer]}`}>{layer}</span>
            </div>
          )}
          {brothRatio !== null && (
            <div className="flex items-center gap-1.5 border-l border-border pl-4">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">ProporciÃ³n</span>
              <span className="font-bold">{brothRatio}:1</span>
            </div>
          )}
        </div>
      )}

      {/* Ingredients List */}
      <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-8 overflow-hidden shadow-sm">
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

      <div className="flex flex-col gap-3">
        <AddToCartButton recipeId={recipe.id} isAuthenticated={isAuthenticated} baseServings={servings} />
      </div>
      
      <div className="mt-8 w-full">
        {children}
      </div>
    </div>
  );
}
