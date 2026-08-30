const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  'await createStory({',
  'await createStory({\n        mediaTransform,\n        background,'
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed createStory call');
