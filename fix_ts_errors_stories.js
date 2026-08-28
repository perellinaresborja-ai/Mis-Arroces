const fs = require('fs');

// 1. Fix SharedStoryRenderer payloads
let r = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
r = r.replace(/overlay\.payload\.location/g, 'overlay.payload.name');
r = r.replace(/overlay\.payload\.title/g, '((overlay.payload as any).title || (overlay.payload as any).authorName || "")');
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', r);

// 2. Fix StickerPickers fetch
let sp = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');
sp = sp.replace(/recipe_media\(storage_path\)/g, 'recipe_media(media:media_assets(storage_path))');
sp = sp.replace(/r\.recipe_media\?\.\[0\]\?\.storage_path/g, '(r.recipe_media?.[0] as any)?.media?.storage_path');
sp = sp.replace(/ingredients_base/g, 'ingredients');
fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', sp);

// 3. Fix StoryCreator payload assignments
let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
sc = sc.replace(/payload = \{ location: data\.title \}/g, 'payload = { name: data.title }');
sc = sc.replace(/payload = \{ title: data\.title, sessionId: data\.id \}/g, 'payload = { authorName: data.title, sessionId: data.id }');
sc = sc.replace(/privacy,/g, '// privacy,');
fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
