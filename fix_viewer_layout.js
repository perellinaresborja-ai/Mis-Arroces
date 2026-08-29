const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-col drop-shadow-md">/,
  '<div className="flex flex-col drop-shadow-md min-w-0 flex-1 overflow-hidden">'
);
code = code.replace(
  /<span className="font-bold text-sm leading-tight">\{currentGroup\.author\?\.display_name \|\| currentGroup\.author\?\.username\}<\/span>/,
  '<span className="font-bold text-sm leading-tight truncate">{currentGroup.author?.display_name || currentGroup.author?.username}</span>'
);
code = code.replace(
  /<span className="text-xs text-white\/80">\{formatRelativeTime\(currentStory\.created_at\)\}<\/span>/,
  '<span className="text-xs text-white/80 truncate">{formatRelativeTime(currentStory.created_at)}</span>'
);

code = code.replace(
  /<div className="flex gap-2 relative z-50 pointer-events-auto">/,
  '<div className="flex gap-2 relative z-50 pointer-events-auto shrink-0">'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed flex layout');
