const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  /bg-primary text-primary-foreground( rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm pointer-events-none")/,
  'bg-[#E69A21] text-white$1'
);

// Just in case they mean the empty state dashed circle:
code = code.replace(
  /<div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary\/50 flex items-center justify-center text-primary\/50">/g,
  '<div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-[#E69A21]/50 flex items-center justify-center text-[#E69A21]">'
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed StoriesBar + icon color');
