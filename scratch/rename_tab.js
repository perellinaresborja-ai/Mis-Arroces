const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/cookbook/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(
  '>\n          Mis arroces\n        </Link>',
  '>\n          Mis recetas creadas\n        </Link>'
);

// Fallback if formatting differs
code = code.replace(/Mis arroces/g, 'Mis recetas');

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Updated tab name in cookbook!");
