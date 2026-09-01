const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(
  '<h2 className="text-xl font-bold font-serif text-charcoal">Ingredientes</h2>',
  '<h2 className="text-lg md:text-xl font-bold font-serif text-charcoal">¿Para cuántos vas a cocinar?</h2>'
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Updated Ingredientes to Para cuántos vas a cocinar");
