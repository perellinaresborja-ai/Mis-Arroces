const fs = require('fs');
let code = fs.readFileSync('src/app/actions/post_options.ts', 'utf8');

code = code.replace(/if \(existing\) \{/, 'if (existing && (existing as any).id) {');
code = code.replace(/existing\.id/g, '(existing as any).id');

fs.writeFileSync('src/app/actions/post_options.ts', code);
console.log("FIXED TS FOR EXISTING.ID");
