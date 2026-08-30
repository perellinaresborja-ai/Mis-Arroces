const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/recetario/page.tsx', 'utf8');

code = code.replace(
  'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"',
  'className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full"'
);
code = code.replace(
  'aspect-[4/3]',
  'aspect-square' // match instagram
);

fs.writeFileSync('src/app/[userParam]/recetario/page.tsx', code);
console.log('Fixed recetario grid');
