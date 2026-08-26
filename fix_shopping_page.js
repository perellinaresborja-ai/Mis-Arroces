const fs = require('fs');

let page = fs.readFileSync('src/app/shopping-list/page.tsx', 'utf8');
page = page.replace(/unit:units\(id, name, symbol\)/g, 'unit:units(id, name)');
fs.writeFileSync('src/app/shopping-list/page.tsx', page, 'utf8');
