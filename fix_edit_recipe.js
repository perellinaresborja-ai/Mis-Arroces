const fs = require('fs');

let file = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

if (!file.includes('EscandalloSection')) {
  file = file.replace(
    'import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"',
    'import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"\nimport { EscandalloSection } from "@/components/domain/EscandalloSection"'
  );
  
  // Inject below the Ingredients section
  file = file.replace(
    /<\/section>\s*\{\/\* Instructions \*\/\}/,
    `</section>\n\n          <EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} />\n\n          {/* Instructions */}`
  );
  
  fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', file, 'utf8');
}
