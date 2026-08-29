const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  /<\/Link>\n\s*\)\}/,
  `</button>\n        )}`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed button closing tag');
