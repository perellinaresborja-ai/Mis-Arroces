const fs = require('fs');
let file = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

file = file.replace(
  'object/public/stories/${mediaPath}',
  'object/public/recipe_media/${mediaPath}'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', file, 'utf8');
