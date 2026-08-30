const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  '<span className="text-xs font-medium text-center truncate w-16">Tu historia</span>',
  '<span className="text-xs font-medium text-center truncate w-full px-1">Subir historia</span>'
);

// We need to change the label w-16 or something? 
// The label has className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0"

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed StoriesBar label');
