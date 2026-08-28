const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  'media={fullUrl}',
  'mediaUrl={fullUrl}'
);
code = code.replace(
  'transform={currentStory.transform}',
  'transform={currentStory.media_transform}'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
