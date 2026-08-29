const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  /<\/Link>/g,
  `</button>`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Replaced all </Link> with </button> in StoriesBar (wait, are there other Links?)');
