const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/cook/CookForm.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(
  '{isSubmitting ? "Guardando..." : "Guardar en mi Cuaderno"}',
  '{isSubmitting ? "Guardando..." : "Guardar en Mis Arroces"}'
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Updated button text to Mis Arroces!");
