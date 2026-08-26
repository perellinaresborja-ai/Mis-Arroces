const fs = require('fs');

let file = fs.readFileSync('src/lib/utils.ts', 'utf8');

if (!file.includes('formatUnitSymbol')) {
  file += `\n
export function formatUnitSymbol(unitName: string | null | undefined): string {
  if (!unitName) return ""
  const lower = unitName.toLowerCase()
  if (lower.includes("gramo")) return "g."
  if (lower.includes("kilo")) return "kg."
  if (lower.includes("mililitro")) return "ml."
  if (lower.includes("litro")) return "L."
  if (lower.includes("cuchara")) return "cda."
  if (lower.includes("pizca")) return "pizca."
  if (lower.includes("unidad")) return "ud."
  return unitName // fallback if unknown
}\n`;

  fs.writeFileSync('src/lib/utils.ts', file, 'utf8');
}
