const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(
  /export function StoriesViewer\(\{ groupedStories, initialGroupIndex, onClose, currentUser \}: any\) \{/g,
  `export function StoriesViewer({ groupedStories: _groupedStories, initialGroupIndex: _initialGroupIndex, stories, initialIndex, onClose, currentUser, currentUserId }: any) {
  const groupedStories = _groupedStories || [{ author: stories?.[0]?.author || stories?.[0]?.profiles || { id: stories?.[0]?.owner_id }, stories: stories || [] }];
  const initialGroupIndex = _initialGroupIndex || 0;`
);

// Fix initial storyIndex
code = code.replace(
  /const \[storyIndex, setStoryIndex\] = useState\(0\)/,
  `const [storyIndex, setStoryIndex] = useState(initialIndex || 0)`
);

// Fix isMe
code = code.replace(
  /const isMe = currentUser\?\.id === currentGroup\?\.author\?\.id \|\| currentUser\?\.id === currentStory\?\.owner_id;/,
  `const isMe = (currentUser?.id || currentUserId) === currentGroup?.author?.id || (currentUser?.id || currentUserId) === currentStory?.owner_id;`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed StoriesViewer props');
