const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

if (!code.includes('recipe_vessels(*),')) {
  code = code.replace(/heat:heat_sources\(name\),/g, 'heat:heat_sources(name),\n        recipe_vessels(*),');
  fs.writeFileSync(targetFile, code);
  console.log("Successfully injected recipe_vessels(*)");
} else {
  console.log("Already has recipe_vessels(*)");
}
