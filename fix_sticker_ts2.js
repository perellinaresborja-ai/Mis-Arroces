const fs = require('fs');

let sp = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');
sp = sp.replace(/\$\{r\.recipe_media\[0\]\.storage_path\}/g, '${((r.recipe_media?.[0] as any)?.media as any)?.storage_path}');

fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', sp);
