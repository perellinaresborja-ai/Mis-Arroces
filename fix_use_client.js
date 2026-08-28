const fs = require('fs');
let c = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
if (!c.startsWith('"use client"')) {
  fs.writeFileSync('src/components/domain/StoryCreator.tsx', '"use client";\n' + c);
}
