const fs = require('fs');
let c1 = fs.readFileSync('src/components/domain/stories/DraggableOverlay.tsx', 'utf8');
c1 = c1.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/components/domain/stories/DraggableOverlay.tsx', c1);

let c2 = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');
c2 = c2.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', c2);
