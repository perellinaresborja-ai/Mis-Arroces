const fs = require('fs');
let f = fs.readFileSync('src/components/domain/AddToCartButton.tsx', 'utf8');

f = f.replace(
  /router\.push\(\\\`\/login\?returnTo=\/recipes\/\\\$\\{recipeId\\}\\\`\)/,
  'router.push(`/login?returnTo=/recipes/${recipeId}`)'
);
// just strip backslash completely if it's there
f = f.replace(/\\\`/g, '`');

fs.writeFileSync('src/components/domain/AddToCartButton.tsx', f, 'utf8');
