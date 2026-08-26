const fs = require('fs');
let page = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

page = page.replace(
  '                </ul>\r\n            </div>',
  '                </ul>\n                <div className="mt-8">\n                  <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} />\n                </div>\n            </div>'
);
page = page.replace(
  '                </ul>\n            </div>',
  '                </ul>\n                <div className="mt-8">\n                  <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} />\n                </div>\n            </div>'
);

fs.writeFileSync('src/app/recipes/[id]/page.tsx', page, 'utf8');
