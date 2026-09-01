const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Change items-center back to items-stretch
code = code.replace(
  'className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"',
  'className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch"'
);

// 2. Add justify-between h-full to the right column
// Search for: className="md:col-span-7 flex flex-col order-1 md:order-2"
code = code.replace(
  'className="md:col-span-7 flex flex-col order-1 md:order-2"',
  'className="md:col-span-7 flex flex-col justify-between order-1 md:order-2 h-full"'
);

// We need to also wrap the top content in a div so it groups Title/Desc/Stats together,
// and the Ficha/Button together at the bottom?
// The user says "este bloque puede medir de alto igual que la foto?"
// If we just do justify-between, it will put gaps between EVERY child. 
// Title ... [gap] ... Desc ... [gap] ... Stats ... [gap] ... Ficha ... [gap] ... Button
// That might look nice! Let's just try justify-between on the flex column.

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Updated grid height alignment successfully!");
