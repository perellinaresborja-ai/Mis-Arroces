const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldHeaderRegex = /\{\/\*\s*Mobile Top Header\s*\*\/\}\s*<div className="md:hidden flex items-center justify-between p-4">[\s\S]*?<\/div>\s*\{\/\*\s*Anonymous Welcome Header\s*\*\/\}/;

c = c.replace(oldHeaderRegex, '{/* Anonymous Welcome Header */}');

fs.writeFileSync('src/app/page.tsx', c);
