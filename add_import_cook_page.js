const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/cook/page.tsx', 'utf8');
if (!code.includes('import { BackButton }')) {
  code = 'import { BackButton } from "@/components/domain/BackButton"\n' + code;
  fs.writeFileSync('src/app/recipes/[id]/cook/page.tsx', code);
}
console.log('Added import to cook page');
