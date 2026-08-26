const fs = require('fs');

let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// Replace both variants (with and without Mojibake)
editForm = editForm.replace(
  '<div className="mt-6 pt-4 border-t border-border flex justify-between items-center">\n                <p className="text-sm text-muted-foreground">Â¿Vas a prepararlo pronto?</p>\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n              </div>',
  '<div className="mt-6 pt-4 border-t border-border">\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="horizontal" />\n              </div>'
);

editForm = editForm.replace(
  '<div className="mt-6 pt-4 border-t border-border flex justify-between items-center">\n                <p className="text-sm text-muted-foreground">¿Vas a prepararlo pronto?</p>\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n              </div>',
  '<div className="mt-6 pt-4 border-t border-border">\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="horizontal" />\n              </div>'
);

// Fallback if I already ran fix_layout2.js (which I didn't yet, but just in case)
editForm = editForm.replace(
  /<div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">\s*<p className="text-sm text-muted-foreground text-center mb-1">¿Vas a prepararlo pronto\?<\/p>\s*<AddToCartButton recipeId=\{recipe\.id\} isAuthenticated=\{true\} layout="horizontal" \/>\s*<\/div>/g,
  '<div className="mt-6 pt-4 border-t border-border">\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="horizontal" />\n              </div>'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');
