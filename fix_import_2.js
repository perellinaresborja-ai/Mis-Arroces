const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /import \{ globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, clearGlobalStoryDraft \} from '@\/lib\/story-draft';/,
  `import { globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, clearGlobalStoryDraft, setGlobalStoryDraft } from '@/lib/story-draft';`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed import 2');
