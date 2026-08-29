const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
const lines = code.split('\n');
const fixedLines = lines.map(l => l.trim() === 'from "@/components/domain/EscandalloSection"' ? '' : l);
// Wait, I need to put back the import EscandalloSection!
// Right now it says:
// import { NutritionSection } from "@/components/domain/NutritionSection"
// import { calculateNutrition } from "@/lib/nutrition"
//  from "@/components/domain/EscandalloSection"

const fixedCode = fixedLines.join('\n').replace(
  'import { calculateNutrition } from "@/lib/nutrition"',
  'import { calculateNutrition } from "@/lib/nutrition"\nimport { EscandalloSection } from "@/components/domain/EscandalloSection"'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', fixedCode);
console.log('Fixed syntax correctly');
