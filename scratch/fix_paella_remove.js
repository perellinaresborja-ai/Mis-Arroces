const fs = require('fs');
const path = require('path');

const interactivePath = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let interactiveCode = fs.readFileSync(interactivePath, 'utf8');

const paellaRegex = /\{\s*\/\*\s*Paella Calculator Simple Summary\s*\*\/\}[\s\S]*?(?=\{\/\* Ingredients List \*\/\}|$)/;

if (paellaRegex.test(interactiveCode)) {
  interactiveCode = interactiveCode.replace(paellaRegex, '');
  fs.writeFileSync(interactivePath, interactiveCode, 'utf8');
  console.log("Removed Paella card from Ingredients safely!");
} else {
  console.log("Could not find Paella card to remove!");
}
