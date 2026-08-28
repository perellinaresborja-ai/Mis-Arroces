const fs = require('fs');
let code = fs.readFileSync('src/app/login/actions.ts', 'utf8');

// replace redirect("/cookbook") with redirect("/")
code = code.replace(/redirect\("\/cookbook"\)/g, 'redirect("/")');
code = code.replace(/next=\/cookbook/g, 'next=/');

fs.writeFileSync('src/app/login/actions.ts', code);
console.log("UPDATED REDIRECTS TO INICIO");
