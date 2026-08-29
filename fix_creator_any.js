const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /const handleStickerSelect = \(type: string, data: \{ id: string, title: string \}\) => \{/,
  'const handleStickerSelect = (type: string, data: { id: string, title: string, coverUrl?: string }) => {'
);

code = code.replace(
  /\(data as any\)\.coverUrl/g,
  'data.coverUrl'
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('StoryCreator fixed.');
