const fs = require('fs');

let file = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

const oldFunc = `const formatQuantity = (qty: number | null, unitSymbol: string | null) => {
    if (!qty) return ""
    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\\.00$/, "")
    return \`\${formattedQty} \${unitSymbol || ""}\`.trim()
  }`;

const newFunc = `const formatQuantity = (qty: number | null, unitName: string | null) => {
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

file = file.replace(oldFunc, newFunc);
fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', file, 'utf8');
