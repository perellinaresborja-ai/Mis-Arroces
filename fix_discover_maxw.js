const fs = require('fs');
let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

code = code.replace(
  '<div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto pb-24">',
  '<div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-24">'
);

fs.writeFileSync('src/app/discover/page.tsx', code);
console.log('Fixed max-w in Discover');
