const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /import \{ getGlobalStoryDraft, clearGlobalStoryDraft \} from '@\/lib\/story-draft';/,
  `import { getGlobalStoryDraft, clearGlobalStoryDraft, setGlobalStoryDraft } from '@/lib/story-draft';`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed import');
