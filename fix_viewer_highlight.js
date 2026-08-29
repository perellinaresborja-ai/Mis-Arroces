const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (!code.includes('AddToHighlightModal')) {
  code = code.replace(
    /import \{ ShareDMModal \} from "\.\/ShareDMModal"/,
    `import { ShareDMModal } from "./ShareDMModal"
import { AddToHighlightModal } from "./AddToHighlightModal"`
  );
}

code = code.replace(
  /\{highlightModalOpen && \(\n\s*<StoryOwnerMenu[^>]+>\n\s*\)\}/, 
  `` // Just in case it was there somehow
);

// We need to add the AddToHighlightModal where highlightModalOpen is checked
code = code.replace(
  /\{insightsOpen && \(/,
  `{highlightModalOpen && isMe && (
            <AddToHighlightModal 
              storyId={currentStory.id}
              coverUrl={mediaPath}
              currentUserId={currentUser?.id || currentUserId || ''}
              onClose={() => { setHighlightModalOpen(false); setIsPaused(false); }}
            />
          )}
          {insightsOpen && (`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed StoriesViewer to mount AddToHighlightModal');
