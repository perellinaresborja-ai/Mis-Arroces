const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const correctModals = `
          {ownerMenuOpen && (
            <StoryOwnerMenu 
              storyId={currentStory.id} 
              onClose={() => { setOwnerMenuOpen(false); setIsPaused(false); }} 
              onDeleted={onClose}
              onOpenInsights={() => { setInsightsOpen(true); }}
              onOpenHighlight={() => { setHighlightModalOpen(true); }}
            />
          )}
          {insightsOpen && (
            <StoryInsightsModal 
              storyId={currentStory.id}
              onClose={() => { setInsightsOpen(false); setIsPaused(false); }}
            />
          )}
`;

code = code.replace(/\{ownerMenuOpen && \([\s\S]*?\{insightsOpen && \([\s\S]*?\n\s*\)\}/, correctModals.trim());
fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed modals');
