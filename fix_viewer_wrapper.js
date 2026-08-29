const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  /<div className="flex items-center gap-3">/,
  '<div className="flex items-center gap-3 flex-1 min-w-0">'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed flex wrapper');
