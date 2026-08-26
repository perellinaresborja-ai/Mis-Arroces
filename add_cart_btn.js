const fs = require('fs');

let page = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

// Import AddToCartButton
if (!page.includes('AddToCartButton')) {
  page = page.replace(
    'import { SaveRecipeButton } from "@/components/domain/SaveRecipeButton"',
    'import { SaveRecipeButton } from "@/components/domain/SaveRecipeButton"\nimport { AddToCartButton } from "@/components/domain/AddToCartButton"'
  );
}

// Add it under ingredients list
page = page.replace(
  '                </ul>\n            </div>',
  '                </ul>\n                <div className="mt-8">\n                  <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} />\n                </div>\n            </div>'
);

// We don't have session?.user here. It uses user.
page = page.replace(/isAuthenticated=\{!!session\?.user\}/g, 'isAuthenticated={!!user}');

fs.writeFileSync('src/app/recipes/[id]/page.tsx', page, 'utf8');
