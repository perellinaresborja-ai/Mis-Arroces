const fs = require('fs');

// 1. Update EscandalloSection.tsx to take setValue and call it
let escandallo = fs.readFileSync('src/components/domain/EscandalloSection.tsx', 'utf8');
escandallo = escandallo.replace(
  'export function EscandalloSection({ recipeId, initialIngredients, catalogs, baseServings }: any) {',
  'export function EscandalloSection({ recipeId, initialIngredients, catalogs, baseServings, setValue }: any) {'
);
escandallo = escandallo.replace(
  'const idx = newCosts.findIndex(c => c.id === ingId)',
  `const idx = newCosts.findIndex(c => c.id === ingId)
    // Also save to form state
    const fieldIdx = initialIngredients.findIndex((i: any) => (i.db_id || i.id) === ingId)
    if (fieldIdx >= 0 && setValue) {
      setValue(\`ingredients.\${fieldIdx}.costData\`, { purchase_amount: purchaseAmount, purchase_unit_id: purchaseUnitId, purchase_price: purchasePrice })
    }`
);
fs.writeFileSync('src/components/domain/EscandalloSection.tsx', escandallo, 'utf8');

// 2. Update EditRecipeForm.tsx to pass setValue
let form = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
form = form.replace(
  /<EscandalloSection recipeId=\{recipe\.id\} initialIngredients=\{ingFields\} catalogs=\{catalogs\} baseServings=\{Number\(watch\("base_servings"\) \|\| 2\)\} \/>/,
  '<EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />'
);
fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', form, 'utf8');

// 3. Update updateRecipeFull to save costs
let actions = fs.readFileSync('src/app/actions/recipes.ts', 'utf8');
const costUpsertBlock = `
      const { error: ingError } = await supabase.from("recipe_ingredients").upsert(ingsToUpsert);
      if (ingError) console.error("ING UPSERT ERROR:", ingError);

      // Now save costs
      const costsToUpsert = ingredients
        .filter((i: any) => i.costData)
        .map((i: any) => ({
          id: i.db_id || i.id, // the ID used in ingsToUpsert
          recipe_id: id,
          owner_id: user.id,
          purchase_amount: i.costData.purchase_amount,
          purchase_unit_id: i.costData.purchase_unit_id,
          purchase_price: i.costData.purchase_price
        }));
      
      if (costsToUpsert.length > 0) {
        const { error: costError } = await supabase.from("recipe_ingredient_costs").upsert(costsToUpsert);
        if (costError) console.error("COST UPSERT ERROR:", costError);
      }
`;
actions = actions.replace(
  'const { error: ingError } = await supabase.from("recipe_ingredients").upsert(ingsToUpsert);\n      if (ingError) console.error("ING UPSERT ERROR:", ingError);',
  costUpsertBlock
);
fs.writeFileSync('src/app/actions/recipes.ts', actions, 'utf8');
