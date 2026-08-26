const fs = require('fs');

let file = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

if (!file.includes('formatUnitSymbol')) {
  file = file.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { formatUnitSymbol } from "@/lib/utils"'
  );
  fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', file, 'utf8');
}
