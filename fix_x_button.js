const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  '<button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">',
  '<button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm relative z-50 pointer-events-auto">'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
