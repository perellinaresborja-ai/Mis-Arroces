const fs = require('fs');

let code = fs.readFileSync('src/components/domain/EditHighlightModal.tsx', 'utf8');

code = code.replace(
  /highlight: any, archivedStories: any\[\]/g,
  'highlight: { id: string, name: string, stories?: { id: string }[] }, archivedStories: { id: string, story_media?: { storage_path: string }[] }[]'
);

code = code.replace(
  /\(s:any\)/g,
  '(s: { id: string })'
);

fs.writeFileSync('src/components/domain/EditHighlightModal.tsx', code);
console.log('EditHighlightModal fixed.');
