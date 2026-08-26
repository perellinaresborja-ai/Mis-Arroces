const fs = require('fs');

let file = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

file = file.replace(
  /\/object\/public\/avatars\//g,
  '/object/public/recipe_media/'
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', file, 'utf8');
