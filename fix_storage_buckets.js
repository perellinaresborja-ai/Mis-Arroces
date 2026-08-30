const fs = require('fs');

// Fix StoryCreator.tsx
let storyCreatorCode = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
storyCreatorCode = storyCreatorCode.replace(
  /supabase\.storage\.from\('media'\)\.upload\(`/g,
  "supabase.storage.from('recipe_media').upload(`"
);
fs.writeFileSync('src/components/domain/StoryCreator.tsx', storyCreatorCode);

// Fix page.tsx
let storyPageCode = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');
storyPageCode = storyPageCode.replace(
  /supabase\.storage\.from\('media'\)\.getPublicUrl\(/g,
  "supabase.storage.from('recipe_media').getPublicUrl("
);
fs.writeFileSync('src/app/create/story/page.tsx', storyPageCode);

console.log('Fixed storage bucket references');
