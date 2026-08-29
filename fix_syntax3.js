const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
code = code.replace(/import \{ EscandalloSection \}\r?\n/, '');
fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', code);
console.log('Fixed syntax for real');
