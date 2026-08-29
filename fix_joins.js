const fs = require('fs');

let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
code = code.replace(
  /select\('\*, story_media\(media_id, media:media_assets\(storage_path\)\)'\)/g,
  `select('*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path))')`
);
fs.writeFileSync('src/app/actions/stories.ts', code);

let hCode = fs.readFileSync('src/app/actions/highlights.ts', 'utf8');
hCode = hCode.replace(
  /select\('story_id, stories\(\*, story_media\(media_id, media:media_assets\(storage_path\)\)\)'\)/g,
  `select('story_id, stories(*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path)))')`
);
fs.writeFileSync('src/app/actions/highlights.ts', hCode);

let aCode = fs.readFileSync('src/app/profile/story-archive/page.tsx', 'utf8');
aCode = aCode.replace(
  /select\("\*, story_media\(\*\)"\)/g,
  `select("*, author:profiles!stories_owner_id_fkey(*), story_media(*)")`
);
fs.writeFileSync('src/app/profile/story-archive/page.tsx', aCode);

console.log('Joined profiles!');
