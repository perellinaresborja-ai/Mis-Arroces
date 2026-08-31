"use client";

import { useState } from "react";
import { formatUnitSymbol } from "@/lib/utils";
import { Users, Droplet, Scaling, Info } from "lucide-react";
import { 
  DEFAULT_RICE_PER_PERSON, 
  extractRealRiceGrams, 
  extractRealBrothGrams, 
  calculateLayer, 
  getRecommendedDiameter, 
  getBrothRatio,
  LayerType
} from "@/lib/paella-calculator";
import { AddToCartButton } from "@/components/domain/AddToCartButton";

export function InteractiveRecipeView({ 
  recipe, 
  isAuthenticated,
  children
}: { 
  recipe: any, 
  isAuthenticated: boolean,
  children: React.ReactNode // For Nutrition/Allergens
}) {
  const [servings, setServings] = useState(recipe.base_servings || 4);
  const [ricePerPerson, setRicePerPerson] = useState(DEFAULT_RICE_PER_PERSON);

  const scaleRatio = servings / (recipe.base_servings || 1);
  
  const vessel = recipe.recipe_vessels?.[0];
  const variety = recipe.variety?.name;
  
  // Base values from recipe
  const baseRiceGrams = extractRealRiceGrams(recipe.ingredients) || ((recipe.base_servings || 4) * ricePerPerson);
  const baseBrothGrams = extractRealBrothGrams(recipe.ingredients);

  // Scaled values
  const currentRiceGrams = baseRiceGrams * scaleRatio;
  const currentBrothGrams = baseBrothGrams ? (baseBrothGrams * scaleRatio) : null;
  const targetBrothRatio = currentBrothGrams ? (currentBrothGrams / (currentRiceGrams || 1)) : getBrothRatio(variety);
  const estimatedBroth = currentBrothGrams || (currentRiceGrams * targetBrothRatio);
  
  // Paella Diameter
  const diameterCm = vessel?.diameter_cm || getRecommendedDiameter(currentRiceGrams, 'Media');
  
  // Layer
  const layer = calculateLayer(currentRiceGrams, diameterCm);

  const layerColors: Record<LayerType, string> = {
    'Fina': 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
    'Media': 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
    'Abundante': 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
  };

  const ingredients = [...(recipe.ingredients || [])].sort((a: any, b: any) => a.display_order - b.display_order);

  // Safe formatting helpers to prevent React SSR NaN/Infinity errors
  const safeNumber = (num: number) => (isFinite(num) && !isNaN(num)) ? Math.round(num).toString() : "0";

  return (
    <div className="w-full">
      {/* Scaler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
        <h2 className="text-xl font-bold font-serif text-charcoal">Ingredientes</h2>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">-</button>
          <span className="font-bold text-lg w-6 text-center">{servings}</span>
          <button onClick={() => setServings(servings + 1)} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">+</button>
        </div>
      </div>

      {/* Paella Calculator Block */}
      {baseRiceGrams > 0 && (
      <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-primary/5 border-b border-border/50 p-4 flex items-center gap-2">
          <Scaling className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-primary">Paella y Cocción</h3>
        </div>
        <div className="p-5 md:p-6 grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Diámetro</p>
            <p className="font-bold text-lg">{diameterCm} cm {!vessel?.diameter_cm && <span className="text-xs text-muted-foreground font-normal">(Recomendado)</span>}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Arroz Total</p>
            <p className="font-bold text-lg">{safeNumber(currentRiceGrams)} g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Capa Estimada</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${layerColors[layer]}`}>
              {layer}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Caldo Orientativo</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <Droplet className="w-4 h-4 text-blue-500" />
              {safeNumber(estimatedBroth)} {currentBrothGrams ? 'g' : 'ml'}
            </p>
            <p className="text-xs text-muted-foreground">Proporción {(isFinite(targetBrothRatio) && !isNaN(targetBrothRatio)) ? targetBrothRatio.toFixed(1) : "0"}:1</p>
          </div>
          
          <div className="col-span-2 mt-2">
             <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Arroz por persona estimado: {safeNumber(servings > 0 ? currentRiceGrams / servings : 0)}g</p>
             {!vessel?.diameter_cm && (
               <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Info className="w-3.5 h-3.5" /> Para mantener una capa fina recomendamos aprox. una paella de {getRecommendedDiameter(currentRiceGrams, 'Fina')} cm.</p>
             )}
          </div>
        </div>
      </div>
      )}

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

      <AddToCartButton recipeId={recipe.id} isAuthenticated={isAuthenticated} baseServings={servings} />
      
      <div className="mt-8 w-full">
        {children}
      </div>
    </div>
  );
}
