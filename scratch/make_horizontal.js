const fs = require('fs');
const path = require('path');

// 1. Update AddToCartButton to use sm:flex-row
const btnPath = path.resolve('src/components/domain/AddToCartButton.tsx');
let btnCode = fs.readFileSync(btnPath, 'utf8');

btnCode = btnCode.replace(/"flex-row"/g, '"flex-col sm:flex-row"');
fs.writeFileSync(btnPath, btnCode, 'utf8');

// 2. Pass layout="horizontal" from InteractiveRecipeView
const interactivePath = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let interactiveCode = fs.readFileSync(interactivePath, 'utf8');

interactiveCode = interactiveCode.replace(
  '<AddToCartButton recipeId={recipe.id} isAuthenticated={isAuthenticated} baseServings={servings} />',
  '<AddToCartButton recipeId={recipe.id} isAuthenticated={isAuthenticated} baseServings={servings} layout="horizontal" />'
);

fs.writeFileSync(interactivePath, interactiveCode, 'utf8');
console.log("Made buttons horizontal!");
