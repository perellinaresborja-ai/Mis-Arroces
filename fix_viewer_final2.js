const fs = require('fs');

let lines = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8').split('\n');

// Filter out all use clients and imports from the top
lines = lines.filter(l => !l.includes('use client') && !l.includes('StoryOwnerMenu') && !l.includes('StoryInsightsModal'));

lines.unshift('import { StoryInsightsModal } from "./StoryInsightsModal"');
lines.unshift('import { StoryOwnerMenu } from "./StoryOwnerMenu"');
lines.unshift('"use client"');

// Now add the states if missing
let code = lines.join('\n');
if (!code.includes('const [ownerMenuOpen')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\);/,
    `const [showViewers, setShowViewers] = useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);`
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed header');
