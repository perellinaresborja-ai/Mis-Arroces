const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/cook/page.tsx', 'utf8');
code = code.replace(
  /<h1 className="text-2xl font-bold">Lo he cocinado<\/h1>/,
  '<div className="flex items-center justify-center relative"><div className="absolute left-0"><BackButton /></div><h1 className="text-2xl font-bold">Lo he cocinado</h1></div>'
);
fs.writeFileSync('src/app/recipes/[id]/cook/page.tsx', code);
console.log('Updated cook page JS');
