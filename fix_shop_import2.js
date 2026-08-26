const fs = require('fs');
let file = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

file = file.replace('"use client"', '"use client"\nimport { formatUnitSymbol } from "@/lib/utils"');

fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', file, 'utf8');
