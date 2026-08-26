const fs = require('fs');

// 1. EditRecipeForm.tsx
let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
if (!editForm.includes('formatUnitSymbol')) {
  editForm = editForm.replace(
    'import { cn } from "@/lib/utils"',
    'import { cn, formatUnitSymbol } from "@/lib/utils"'
  );
  // Re-read in case the import was already something else
  if (!editForm.includes('formatUnitSymbol')) {
     editForm = editForm.replace('import { cn', 'import { cn, formatUnitSymbol');
  }
}

editForm = editForm.replace(
  '{catalogs.units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}',
  '{catalogs.units.map((u: any) => <option key={u.id} value={u.id}>{formatUnitSymbol(u.name)}</option>)}'
);
fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');

// 2. ShoppingListClient.tsx
let shopClient = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');
if (!shopClient.includes('formatUnitSymbol')) {
  shopClient = shopClient.replace(
    'import { Check, Trash2, ArrowLeft } from "lucide-react"',
    'import { Check, Trash2, ArrowLeft } from "lucide-react"\nimport { formatUnitSymbol } from "@/lib/utils"'
  );
}
const oldFormatQty = `const formatQuantity = (qty: number | null, unitName: string | null) => {
    if (!qty) return ""
    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\\.00$/, "")
    
    let symbol = unitName || ""
    const lower = symbol.toLowerCase()
    if (lower.includes("gramo")) symbol = "g"
    else if (lower.includes("kilo")) symbol = "kg"
    else if (lower.includes("mililitro")) symbol = "ml"
    else if (lower.includes("litro")) symbol = "L"
    else if (lower.includes("cuchara")) symbol = "cda."
    else if (lower.includes("pizca")) symbol = "pizca"
    else if (lower.includes("unidad")) symbol = "ud"

    return \`\${formattedQty} \${symbol}\`.trim()
  }`;

const newFormatQty = `const formatQuantity = (qty: number | null, unitName: string | null) => {
    if (!qty) return ""
    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\\.00$/, "")
    return \`\${formattedQty} \${formatUnitSymbol(unitName)}\`.trim()
  }`;

shopClient = shopClient.replace(oldFormatQty, newFormatQty);
fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', shopClient, 'utf8');

// 3. recipes/[id]/page.tsx
let recipePage = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');
if (!recipePage.includes('formatUnitSymbol')) {
  recipePage = recipePage.replace(
    'import { cn } from "@/lib/utils"',
    'import { cn, formatUnitSymbol } from "@/lib/utils"'
  );
  if (!recipePage.includes('formatUnitSymbol')) {
      recipePage = recipePage.replace('import { Button } from "@/components/ui/button"', 'import { Button } from "@/components/ui/button"\nimport { formatUnitSymbol } from "@/lib/utils"');
  }
}

recipePage = recipePage.replace(
  '{ing.normalized_quantity} {ing.unit?.name || ""}',
  '{ing.normalized_quantity} {formatUnitSymbol(ing.unit?.name)}'
);

fs.writeFileSync('src/app/recipes/[id]/page.tsx', recipePage, 'utf8');
