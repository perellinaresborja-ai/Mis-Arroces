const fs = require('fs');

let shopping = fs.readFileSync('src/app/actions/shopping.ts', 'utf8');

// 1. Remove symbol from selects
shopping = shopping.replace(/unit:units\(id, name, symbol\)/g, 'unit:units(id, name)');

// 2. Change u.symbol to u.name
shopping = shopping.replace(/u\.symbol\?/g, 'u.name?');

fs.writeFileSync('src/app/actions/shopping.ts', shopping, 'utf8');
