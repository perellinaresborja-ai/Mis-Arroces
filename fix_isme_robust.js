const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  'const isMe = currentUser?.id === currentGroup?.author?.id',
  'const isMe = currentUser?.id === currentGroup?.author?.id || currentUser?.id === currentStory?.owner_id'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
