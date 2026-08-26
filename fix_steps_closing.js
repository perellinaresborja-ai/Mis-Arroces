const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// Fix the button closure for Steps
f = f.replace(
  '              <Plus className="w-4 h-4 mr-1" /> AÃ±adir\n            </Button>\n          </div>',
  '              <Plus className="w-4 h-4 mr-1" /> Añadir\n            </Button>}>'
);
// just in case of different spaces
f = f.replace(
  /<\/Button>\s*<\/div>\s*<div className="space-y-4">\s*\{stepFields\.map/,
  '</Button>}>\n          <div className="space-y-4">\n            {stepFields.map'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
