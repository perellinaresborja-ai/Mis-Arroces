const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// The exact string causing the issue:
code = code.replace(/alert\('ReacciÃ³n ' \+ emoji \+ ' enviada'\);/g, '');
code = code.replace(/alert\('Reacción ' \+ emoji \+ ' enviada'\);/g, '');
// Just in case it has weird characters, let's use regex to catch the alert
code = code.replace(/alert\(['`"]Reacci(o|ó|Ã³)n ['`"] \+ emoji \+ ['`"] enviada['`"]\);/g, '');
code = code.replace(/alert\('Reacci[^']*' \+ emoji \+ ' enviada'\);/g, '');

// Wait, let's just use regex to remove ANY alert containing 'emoji' inside the map
code = code.replace(/alert\([^)]*emoji[^)]*\);/g, '');

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Removed alert popup for reactions');
