const fs = require('fs');
let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
sc = sc.replace(/const \[\/\/ privacy, setPrivacy\]/g, 'const [privacy, setPrivacy]');
fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
