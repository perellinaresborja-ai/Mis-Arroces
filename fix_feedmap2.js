const fs = require('fs');
let code = fs.readFileSync('src/app/actions/feed.ts', 'utf8');

code = code.replace(/if \(user\) \{/, `let followStatusMap: Record<string, string> = {}\n  if (user) {`);
code = code.replace(/const followStatusMap = /, `followStatusMap = `);

fs.writeFileSync('src/app/actions/feed.ts', code);
console.log("FIXED BLOCK SCOPE");
