const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (!code.includes('StoryOwnerMenu')) {
  code = code.replace(
    /import \{ X, ChevronRight, ChevronLeft, EyeIcon, BarChart2 \} from "lucide-react"/,
    `import { X, ChevronRight, ChevronLeft, EyeIcon, BarChart2, MoreHorizontal } from "lucide-react"\nimport { StoryOwnerMenu } from "./StoryOwnerMenu"\nimport { StoryInsightsModal } from "./StoryInsightsModal"`
  );
}

if (!code.includes('ownerMenuOpen')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\);/,
    `const [showViewers, setShowViewers] = useState(false);\n  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);\n  const [highlightModalOpen, setHighlightModalOpen] = useState(false);`
  );
}

const menuBtn = `{isMe && (
              <button onClick={(e) => { e.stopPropagation(); setOwnerMenuOpen(true); setIsPaused(true); }} className="w-8 h-8 flex items-center justify-center text-white drop-shadow-md">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            )}`;
            
if (!code.includes('setOwnerMenuOpen(true)')) {
  code = code.replace(
    /<button onClick=\{onClose\} className="w-8 h-8 flex items-center justify-center text-white drop-shadow-md">/,
    menuBtn + '\n            ' + `<button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white drop-shadow-md">`
  );
}

const modals = `
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

if (!code.includes('ownerMenuOpen && (')) {
  code = code.replace(
    /\{showViewers && isMe && \(/,
    modals + '\n          {showViewers && isMe && ('
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Patched StoriesViewer');
