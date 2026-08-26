const fs = require('fs');

let page = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// 1. Remove the floating button below EscandalloSection
page = page.replace(
  '<EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />\n\n          <div className="mt-4 flex justify-end">\n            <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n          </div>',
  '<EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />'
);

// Fallback if formatting was slightly different
page = page.replace(
  /<div className="mt-4 flex justify-end">\s*<AddToCartButton recipeId=\{recipe\.id\} isAuthenticated=\{true\} \/>\s*<\/div>/,
  ''
);

// 2. Add the button INSIDE the Ingredientes CollapsibleSection, at the bottom of the list
page = page.replace(
  '            {ingFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay ingredientes añadidos.</p>}\n          </div>\n          </CollapsibleSection>',
  '            {ingFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay ingredientes añadidos.</p>}\n\n            {ingFields.length > 0 && (\n              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">\n                <p className="text-sm text-muted-foreground">¿Vas a prepararlo pronto?</p>\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n              </div>\n            )}\n          </div>\n          </CollapsibleSection>'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', page, 'utf8');
