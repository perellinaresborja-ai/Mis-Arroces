const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// replace {currentUser?.id === currentStory.owner_id ? (
// with {isMe ? (
code = code.replace('{currentUser?.id === currentStory.owner_id ? (', '{isMe ? (');
// also replace it if there's any spacing difference
code = code.replace(/currentUser\?\.id === currentStory\.owner_id/g, 'isMe');

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
