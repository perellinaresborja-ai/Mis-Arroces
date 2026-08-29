const fs = require('fs');

let code = fs.readFileSync('src/components/domain/CreateHighlightModal.tsx', 'utf8');

code = code.replace(
  /archivedStories: any\[\]/g,
  'archivedStories: { id: string, story_media?: { storage_path: string }[] }[]'
);

code = code.replace(
  /\(s:any\)/g,
  '(s: { id: string, story_media?: { storage_path: string }[] })'
);

fs.writeFileSync('src/components/domain/CreateHighlightModal.tsx', code);
console.log('CreateHighlightModal fixed.');
