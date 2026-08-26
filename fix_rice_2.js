const fs = require('fs');
let content = fs.readFileSync('src/app/actions/shopping.ts', 'utf8');

const correctRiceNameLogic = "const riceName = recipe.variety && (recipe.variety as any).name ? `Arroz (${(recipe.variety as any).name})` : 'Arroz';";

content = content.replace(/const riceName = .*?: 'Arroz'/, correctRiceNameLogic);

fs.writeFileSync('src/app/actions/shopping.ts', content, 'utf8');
