import { Database } from "@/types/database.types";

export type Ingredient = Database['public']['Tables']['ingredients']['Row'];
export type Allergen = Database['public']['Tables']['allergens']['Row'];
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'];

export interface NutritionInfo {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  sugar_g: number;
  fat_g: number;
  saturated_fat_g: number;
  fiber_g: number;
  salt_g: number;
}

export interface CalculationResult {
  total: NutritionInfo;
  perServing: NutritionInfo;
  coveragePercent: number;
  isIncomplete: boolean;
  allergens: Allergen[];
}

export function calculateNutrition(
  recipeIngredients: (RecipeIngredient & { 
    ingredient: Ingredient | null,
    ingredient_allergens?: { allergens: Allergen | null }[] 
  })[],
  units: Database['public']['Tables']['units']['Row'][],
  servings: number = 1
): CalculationResult {
  const result: NutritionInfo = {
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    sugar_g: 0,
    fat_g: 0,
    saturated_fat_g: 0,
    fiber_g: 0,
    salt_g: 0
  };
  
  let validIngredients = 0;
  let totalIngredients = recipeIngredients.length;
  const uniqueAllergens = new Map<string, Allergen>();

  for (const ri of recipeIngredients) {
    if (!ri.ingredient) continue; // Custom ingredient with no DB map

    // 1. Allergens computation
    const allergensList = (ri.ingredient as any)?.ingredient_allergens || ri.ingredient_allergens;
    if (allergensList) {
      for (const ia of allergensList) {
        if (ia.allergens) {
          uniqueAllergens.set(ia.allergens.id, ia.allergens);
        }
      }
    }

    // 2. Nutrition computation
    if (ri.ingredient.nutrition_complete) {
      validIngredients++;
      
      const unit = units.find(u => u.id === ri.unit_id);
      let quantityIn100g = 0;

      const qty = Number(ri.normalized_quantity || 0);
      const unitName = unit?.name.toLowerCase() || '';

      if (unitName.includes('gramo') || unitName.includes('g') || unitName.includes('mililitro') || unitName.includes('ml')) {
        quantityIn100g = qty / 100;
      } else if (unitName.includes('kilo') || unitName.includes('kg') || unitName.includes('litro') || unitName.includes('l')) {
        quantityIn100g = (qty * 1000) / 100;
      } else if (unitName.includes('unidad') || unitName.includes('pieza')) {
        const gramsPerUnit = Number(ri.ingredient.default_grams_per_unit || 0);
        quantityIn100g = (qty * gramsPerUnit) / 100;
      } else if (unitName.includes('cucharada')) {
        quantityIn100g = (qty * 15) / 100; // 15g avg
      } else if (unitName.includes('cucharadita')) {
        quantityIn100g = (qty * 5) / 100; // 5g avg
      } else if (unitName.includes('taza')) {
        quantityIn100g = (qty * 250) / 100; // 250ml avg
      } else {
        // Fallback or skip if unit is entirely unmapped and no grams_per_unit
        // To be safe, if we don't know, we shouldn't add garbage data.
        if (Number(ri.ingredient.default_grams_per_unit || 0) > 0) {
           quantityIn100g = (qty * Number(ri.ingredient.default_grams_per_unit)) / 100;
        } else {
           validIngredients--; // We can't calculate this accurately
           continue; 
        }
      }

      result.kcal += (Number(ri.ingredient.kcal_per_100 || 0) * quantityIn100g);
      result.protein_g += (Number(ri.ingredient.protein_g_per_100 || 0) * quantityIn100g);
      result.carbs_g += (Number(ri.ingredient.carbs_g_per_100 || 0) * quantityIn100g);
      result.sugar_g += (Number(ri.ingredient.sugar_g_per_100 || 0) * quantityIn100g);
      result.fat_g += (Number(ri.ingredient.fat_g_per_100 || 0) * quantityIn100g);
      result.saturated_fat_g += (Number(ri.ingredient.saturated_fat_g_per_100 || 0) * quantityIn100g);
      result.fiber_g += (Number(ri.ingredient.fiber_g_per_100 || 0) * quantityIn100g);
      result.salt_g += (Number(ri.ingredient.salt_g_per_100 || 0) * quantityIn100g);
    }
  }

  // Safety for servings
  const safeServings = Math.max(1, servings);

  const perServing = {
    kcal: result.kcal / safeServings,
    protein_g: result.protein_g / safeServings,
    carbs_g: result.carbs_g / safeServings,
    sugar_g: result.sugar_g / safeServings,
    fat_g: result.fat_g / safeServings,
    saturated_fat_g: result.saturated_fat_g / safeServings,
    fiber_g: result.fiber_g / safeServings,
    salt_g: result.salt_g / safeServings,
  };

  return {
    total: result,
    perServing,
    coveragePercent: totalIngredients === 0 ? 0 : Math.round((validIngredients / totalIngredients) * 100),
    isIncomplete: validIngredients < totalIngredients,
    allergens: Array.from(uniqueAllergens.values()).sort((a, b) => a.name.localeCompare(b.name))
  };
}
