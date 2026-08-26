const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

if (!f.includes('AddToCartButton')) {
  f = f.replace(
    'import { ProfileAvatar } from "@/components/domain/ProfileAvatar"',
    'import { ProfileAvatar } from "@/components/domain/ProfileAvatar"\nimport { AddToCartButton } from "@/components/domain/AddToCartButton"'
  );
  
  // Find the end of ingredients list
  f = f.replace(
    '</ul>\n            </div>\n\n            {/* Steps */}',
    '</ul>\n              <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} />\n            </div>\n\n            {/* Steps */}'
  );
  
  fs.writeFileSync('src/app/recipes/[id]/page.tsx', f, 'utf8');
}
