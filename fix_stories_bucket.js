const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

code = code.replace(
  "adminSupabase.storage.from('story_media').createSignedUrl",
  "adminSupabase.storage.from('recipe_media').createSignedUrl"
);

fs.writeFileSync('src/app/actions/stories.ts', code);
