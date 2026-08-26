const fs = require('fs');

let f = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

f = f.replace(
  /return \\\`\\\$[\s\S]*?trim\(\)/,
  'return `${formattedQty} ${unitSymbol || ""}`.trim()'
);

fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', f, 'utf8');
