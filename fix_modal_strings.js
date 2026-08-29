const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryInsightsModal.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/domain/StoryInsightsModal.tsx', code);
