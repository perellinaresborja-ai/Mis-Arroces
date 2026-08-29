const fs = require('fs');
let code = fs.readFileSync('src/app/create/recipe/CreateRecipeForm.tsx', 'utf8');

if (!code.includes('NutritionSection')) {
  code = code.replace(
    /import \{ EscandalloSection \}/,
    `import { EscandalloSection } from "@/components/domain/EscandalloSection"
import { NutritionSection } from "@/components/domain/NutritionSection"
import { calculateNutrition } from "@/lib/nutrition"
`
  );
  
  const beforeReturn = `
  const watchedIngredients = watch('ingredients');
  const watchedPortions = watch('portions');
  
  const computedRecipeIngredients = React.useMemo(() => {
    return watchedIngredients.map((wi: any) => {
      let matchedIng = null;
      if (wi.canonical_ingredient_id) {
        matchedIng = catalogs?.ingredients?.find((i: any) => i.id === wi.canonical_ingredient_id);
      }
      if (!matchedIng && wi.display_text) {
        const query = wi.display_text.trim().toLowerCase();
        matchedIng = catalogs?.ingredients?.find((i: any) => query.includes(i.normalized_name));
      }
      return {
        ...wi,
        ingredient: matchedIng,
        ingredient_allergens: matchedIng?.ingredient_allergens
      };
    });
  }, [watchedIngredients, catalogs]);

  const nutritionResult = React.useMemo(() => {
    return calculateNutrition(computedRecipeIngredients as any, catalogs?.units as any, watchedPortions || 1);
  }, [computedRecipeIngredients, catalogs, watchedPortions]);
  
  return (
  `;

  code = code.replace(/return \(\s*<form/, beforeReturn + '<form');

  code = code.replace(
    /<EscandalloSection/,
    `<NutritionSection result={nutritionResult} servings={watchedPortions || 1} />
        <EscandalloSection`
  );
  
  fs.writeFileSync('src/app/create/recipe/CreateRecipeForm.tsx', code);
  console.log('Added Nutrition to CreateRecipeForm');
}
