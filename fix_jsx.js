const fs = require('fs');

let sessionClient = fs.readFileSync('src/app/sessions/[id]/edit/EditSessionClient.tsx', 'utf8');
sessionClient = sessionClient.replace(/\\\$/g, '$').replace(/\\`/g, '`');
fs.writeFileSync('src/app/sessions/[id]/edit/EditSessionClient.tsx', sessionClient);
console.log("FIXED JSX ESCAPING");
