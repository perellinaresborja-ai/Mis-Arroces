const fs = require('fs');
let content = fs.readFileSync('src/app/actions/shopping.ts', 'utf8');

// Update function signature
content = content.replace(
  'export async function addRecipeToShoppingList(recipeId: string) {',
  'export async function addRecipeToShoppingList(recipeId: string, targetServings?: number) {'
);

// Update select query to fetch base_servings
content = content.replace(
  '.select("rice_qty, stock_qty, variety:rice_varieties(name), recipe_ingredients(*, unit:units(id, name))")',
  '.select("base_servings, rice_qty, stock_qty, variety:rice_varieties(name), recipe_ingredients(*, unit:units(id, name))")'
);

// Apply ratio multiplier
const syntheticStart = content.indexOf('const ingredientsToAdd: any[]');
if (syntheticStart !== -1) {
  const ratioLogic = `
  const ratio = (targetServings && recipe.base_servings) ? targetServings / recipe.base_servings : 1;
  const multiply = (qty: any) => qty ? qty * ratio : null;
`;
  content = content.substring(0, syntheticStart) + ratioLogic + '\n  ' + content.substring(syntheticStart);
}

// Update synthetic quantities
content = content.replace('normalized_quantity: recipe.rice_qty,', 'normalized_quantity: multiply(recipe.rice_qty),');
content = content.replace('normalized_quantity: recipe.stock_qty,', 'normalized_quantity: multiply(recipe.stock_qty),');

// Update loop to multiply recipe_ingredients
const loopStart = content.indexOf('for (const ing of ingredientsToAdd) {');
if (loopStart !== -1) {
  const normInsert = `for (const ing of ingredientsToAdd) {
    if (ing.normalized_quantity && ratio !== 1) {
      ing.normalized_quantity = ing.normalized_quantity * ratio;
    }`;
  content = content.replace('for (const ing of ingredientsToAdd) {', normInsert);
}

fs.writeFileSync('src/app/actions/shopping.ts', content, 'utf8');
