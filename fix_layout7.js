const fs = require('fs');
let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
editForm = editForm.replace('<Plus className="w-4 h-4 mr-1" /> AÃ±adir', '<Plus className="w-4 h-4 mr-1" /> Añadir');
fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');
