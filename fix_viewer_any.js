const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Props any
code = code.replace(/export function StoriesViewer\(\{ groupedStories: _groupedStories, initialGroupIndex: _initialGroupIndex, stories, initialIndex, onClose, currentUser, currentUserId \}: any\) \{/, 'export function StoriesViewer({ groupedStories: _groupedStories, initialGroupIndex: _initialGroupIndex, stories, initialIndex, onClose, currentUser, currentUserId }: { groupedStories?: any[], initialGroupIndex?: number, stories?: any[], initialIndex?: number, onClose: () => void, currentUser?: any, currentUserId?: string }) {');

// 2. viewers any[]
code = code.replace(/const \[viewers, setViewers\] = useState<any\[\]>\(\[\]\)/, 'const [viewers, setViewers] = useState<{id: string, username: string, display_name?: string, avatar?: {storage_path: string}}[]>([]);');

// 3. currentGroup.stories.map
code = code.replace(/\{currentGroup\.stories\.map\(\(s: any, idx: number\) => \{/, '{currentGroup.stories.map((s: {id: string}, idx: number) => {');

// 4. votePoll hack -> handleReaction
code = code.replace(
  /const \{ votePoll \} = await import\('@\/app\/actions\/stories'\);\s*\/\/ Using votePoll as a generic upsert into story_reactions since we built it that way\s*await votePoll\(currentStory\.id, "REACTION", emoji as any\);/,
  'await handleReaction(emoji);'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('StoriesViewer fixed.');
