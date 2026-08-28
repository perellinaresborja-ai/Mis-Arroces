const fs = require('fs');

let code = fs.readFileSync('src/app/recipes/[id]/cook/CookForm.tsx', 'utf8');

code = code.replace(
  /\{isCurrentlyScheduled \? "Publicar ahora" : "Publicar sesión"\}/,
  `{isCurrentlyScheduled ? "Publicar ahora" : "Publicar"}`
);

fs.writeFileSync('src/app/recipes/[id]/cook/CookForm.tsx', code);
console.log("CHANGED BUTTON TEXT");
