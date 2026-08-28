const fs = require('fs');
let c = fs.readFileSync('src/app/cookbook/page.tsx', 'utf8');

c = c.replace(/<Link href="\/create">/g, '<Link href="/create/recipe">');

// There might be another one below: <Link href={tab === "mine" ? "/create" : "/discover"}>
c = c.replace(/\/create"/g, '/create/recipe"');
c = c.replace(/'\/create'/g, "'/create/recipe'");

fs.writeFileSync('src/app/cookbook/page.tsx', c);
