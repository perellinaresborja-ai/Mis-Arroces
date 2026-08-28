const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  '<SharedStoryRenderer \n              mode="VIEWER" \n              media={fullUrl} \n              transform={currentStory.transform}',
  '<SharedStoryRenderer \n              mode="VIEWER" \n              mediaUrl={fullUrl} \n              transform={currentStory.media_transform}'
);

// Also try inline if the newlines are different
code = code.replace(
  'media={fullUrl}',
  'mediaUrl={fullUrl}'
);
code = code.replace(
  'transform={currentStory.transform}',
  'transform={currentStory.media_transform}'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
