const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  /<div className="absolute top-10 right-0 w-5 h-5 bg-\[#E69A21\] text-white rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm pointer-events-none">/,
  `<div 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute top-10 right-0 w-5 h-5 bg-[#E69A21] text-white rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform"
                >`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed StoriesBar.tsx me + button');
