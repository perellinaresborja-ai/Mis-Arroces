const fs = require('fs');
let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// Change avatar size in discover
code = code.replace(
  'className="flex flex-col items-center gap-2 shrink-0 w-20 group"',
  'className="flex flex-col items-center gap-2 shrink-0 w-24 group"'
);
code = code.replace(
  'className="w-16 h-16 rounded-full bg-muted border-2 border-border overflow-hidden group-hover:border-primary transition-colors"',
  'className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-2 border-border overflow-hidden group-hover:border-primary transition-colors shadow-sm"'
);

// Change grid columns from 2 to 3
code = code.replace(
  'className="grid grid-cols-2 gap-4"',
  'className="grid grid-cols-3 gap-2 md:gap-4"'
);

// Adjust recipe card text padding for 3 columns
code = code.replace(
  '<div className="p-3">',
  '<div className="p-2 md:p-3">'
);

fs.writeFileSync('src/app/discover/page.tsx', code);
console.log('Fixed discover sizes and grid columns');
