const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

if (!code.includes('NutritionSection')) {
  code = code.replace(
    /import \{ formatUnitSymbol \} from "@\/lib\/utils"/,
    `import { formatUnitSymbol } from "@/lib/utils"
import { calculateNutrition } from "@/lib/nutrition"
import { NutritionSection } from "@/components/domain/NutritionSection"`
  );

  code = code.replace(
    /unit:units\(name\),/,
    `unit:units(name),
        ingredient:ingredients(*),
        ingredient_allergens(allergens(*)),`
  );

  code = code.replace(
    /<OwnerRecipeActions/,
    `{catalogs?.units && recipe.recipe_ingredients && (
            <NutritionSection 
              result={calculateNutrition(
                recipe.recipe_ingredients as any, 
                catalogs.units as any, 
                recipe.portions
              )} 
              servings={recipe.portions} 
            />
          )}
          <OwnerRecipeActions`
  );

  fs.writeFileSync('src/app/recipes/[id]/page.tsx', code);
  console.log('Added NutritionSection to recipe page');
}
