const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// The header div currently has `z-10`
code = code.replace(
  '<div className="absolute top-4 left-0 w-full z-10 flex items-center justify-between px-4 pt-safe mt-2">',
  '<div className="absolute top-4 left-0 w-full z-50 flex items-center justify-between px-4 pt-safe mt-2">'
);

// The progress bars also have `z-10`
code = code.replace(
  '<div className="absolute top-0 left-0 w-full z-10 flex gap-1 p-2 bg-gradient-to-b from-black/50 to-transparent pt-safe">',
  '<div className="absolute top-0 left-0 w-full z-50 flex gap-1 p-2 bg-gradient-to-b from-black/50 to-transparent pt-safe pointer-events-none">'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
