const fs = require('fs');
let code = fs.readFileSync('src/app/create/post/PostForm.tsx', 'utf8');

code = code.replace(/Int.ntalo/g, "Inténtalo");
code = code.replace(/P.blico/g, "Público");

fs.writeFileSync('src/app/create/post/PostForm.tsx', code);
