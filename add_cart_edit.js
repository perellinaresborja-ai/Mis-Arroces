const fs = require('fs');
let page = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

if (!page.includes('AddToCartButton')) {
  page = page.replace(
    'import { EscandalloSection } from "@/components/domain/EscandalloSection"',
    'import { EscandalloSection } from "@/components/domain/EscandalloSection"\nimport { AddToCartButton } from "@/components/domain/AddToCartButton"'
  );
  
  page = page.replace(
    '<EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />',
    '<EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />\n\n          <div className="mt-4 flex justify-end">\n            <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n          </div>'
  );
  
  fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', page, 'utf8');
}
