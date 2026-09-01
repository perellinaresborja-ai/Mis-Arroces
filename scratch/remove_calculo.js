const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/edit/EditRecipeForm.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(/Información Nutricional \(Cálculo automático\)/g, 'Información Nutricional');
code = code.replace(/Alérgenos \(Cálculo automático\)/g, 'Alérgenos');

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Removed (Cálculo automático) from EditRecipeForm");
