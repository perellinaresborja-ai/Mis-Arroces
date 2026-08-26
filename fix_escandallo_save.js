const fs = require('fs');

// 1. Modify EditRecipeForm.tsx to add db_id
let form = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
form = form.replace(
  /ingredients: \(recipe\.recipe_ingredients \|\| recipe\.ingredients\)\?\.sort\(\(a: any, b: any\) => a\.display_order - \n?b\.display_order\) \|\| \[\]/,
  'ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => ({ ...ing, db_id: ing.id })) || []'
);
// just in case the regex doesn't match multiline well
form = form.replace(
  'ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order) || []',
  'ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => ({ ...ing, db_id: ing.id })) || []'
);

// We should also ensure the Regex matches the exact code
const rx = /ingredients:\s*\([^)]+\)\?\.sort\([^)]+\)\s*\|\|\s*\[\]/;
form = form.replace(
  /ingredients:\s*\(recipe\.recipe_ingredients \|\| recipe\.ingredients\)\?\.sort\(\(a: any, b: any\) => a\.display_order - \n?b\.display_order\) \|\| \[\]/,
  'ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => ({ ...ing, db_id: ing.id })) || []'
)

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', form, 'utf8');

// 2. Modify EscandalloSection.tsx to use db_id
let esc = fs.readFileSync('src/components/domain/EscandalloSection.tsx', 'utf8');

// Replace ing.id with (ing.db_id || ing.id) for the cost matching and saving
esc = esc.replace(/ing\.id/g, "(ing.db_id || ing.id)");
// But in key={ing.id} it should remain ing.id (the react hook form id)
esc = esc.replace(/key=\{\(ing\.db_id \|\| ing\.id\)\}/g, "key={ing.id}");

// Fix the map where we find costRow
// const costRow = costs.find(c => c.id === (ing.db_id || ing.id))
// onBlur={(e) => handleSaveCost((ing.db_id || ing.id), ...)}

// Also wrap the upsert in a try-catch and alert or console.error so it doesn't fail silently
const upsertRegex = /await supabase\.from\("recipe_ingredient_costs"\)\.upsert\(\{[\s\S]*?\}\)/;
esc = esc.replace(upsertRegex, `const { error } = $&;\n    if (error) console.error("Error saving cost:", error)`);

fs.writeFileSync('src/components/domain/EscandalloSection.tsx', esc, 'utf8');
