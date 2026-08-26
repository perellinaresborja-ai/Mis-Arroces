const fs = require('fs');

let page = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

page = page.replace('<Label>Visibilidad</Label>', '<Label>Privacidad</Label>');

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', page, 'utf8');
