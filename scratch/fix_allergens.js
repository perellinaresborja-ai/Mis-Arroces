const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/components/domain/NutritionSection.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(/<span>Alérgenos Detectados<\/span>/g, '<span>Alérgenos</span>');

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Removed 'Detectados' from Allergens title");
