const fs = require('fs');
let page = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

page = page.replace(
  /<\/ul>\s*<\/div>\s*\{\/\* Steps \*\/\}/,
  '</ul>\n              <div className="mt-8">\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} />\n              </div>\n            </div>\n\n            {/* Steps */}'
);

fs.writeFileSync('src/app/recipes/[id]/page.tsx', page, 'utf8');
