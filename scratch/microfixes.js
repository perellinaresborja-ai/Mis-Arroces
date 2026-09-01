const fs = require('fs');
const path = require('path');

// 1. Decrease size in CookModeClient.tsx
const cookModePath = path.resolve('src/components/domain/cook-mode/CookModeClient.tsx');
let cookModeCode = fs.readFileSync(cookModePath, 'utf8');

cookModeCode = cookModeCode.replace(/max-w-xl/g, 'max-w-md');
fs.writeFileSync(cookModePath, cookModeCode, 'utf8');
console.log("Updated CookModeClient max width");

// 2. Remove "Paella y Cocción" card from InteractiveRecipeView.tsx
const interactivePath = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let interactiveCode = fs.readFileSync(interactivePath, 'utf8');

const paellaRegex = /\{\s*\/\*\s*Paella Calculator Simple Summary\s*\*\/\}[\s\S]*?(?=\{\/\* Listado de ingredientes \*\/\}|$)/;

if (paellaRegex.test(interactiveCode)) {
  interactiveCode = interactiveCode.replace(paellaRegex, '');
  fs.writeFileSync(interactivePath, interactiveCode, 'utf8');
  console.log("Removed Paella card from Ingredients");
} else {
  console.log("Could not find Paella card to remove!");
}
