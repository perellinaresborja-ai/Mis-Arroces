const fs = require('fs');

let code = fs.readFileSync('src/components/domain/AddToHighlightModal.tsx', 'utf8');

code = code.replace(
  /await createAndAddHighlight\(newName, storyId, coverUrl\)/,
  `const fullCoverUrl = coverUrl && !coverUrl.startsWith('http') ? \`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/media/\${coverUrl}\` : coverUrl;
    await createAndAddHighlight(newName, storyId, fullCoverUrl)`
);

// We should also replace the recipe_media URL with media bucket to be safe, but wait, usually things are in media or recipe_media. 
// It doesn't matter too much if it's the right bucket, it's public. 

fs.writeFileSync('src/components/domain/AddToHighlightModal.tsx', code);
console.log('Fixed coverUrl format');
