const fs = require('fs');

let code = fs.readFileSync('src/app/actions/highlights.ts', 'utf8');
code = code.replace("name: h.name,\\n      cover_url: h.cover_url,\\n      user_id: h.user_id,", `name: h.name,
      cover_url: h.cover_url,
      user_id: h.user_id,`);
fs.writeFileSync('src/app/actions/highlights.ts', code);
console.log('Fixed literal newlines 2');
