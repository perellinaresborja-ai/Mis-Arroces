const fs = require('fs');

let f = fs.readFileSync('src/app/actions/shopping.ts', 'utf8');
f = f.replace(
  'const convertQuantity = (q: number, fromId: string, toId: string) => {',
  'const convertQuantity = (q: number, fromId: string | null, toId: string | null) => {'
);
fs.writeFileSync('src/app/actions/shopping.ts', f, 'utf8');
