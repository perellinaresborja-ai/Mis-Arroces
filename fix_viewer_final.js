const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace(/import \{ StoryOwnerMenu \} from "\.\/StoryOwnerMenu"\\nimport \{ StoryInsightsModal \} from "\.\/StoryInsightsModal"\\n/, '');
code = code.replace(/"use client"\n/, `"use client"\nimport { StoryOwnerMenu } from "./StoryOwnerMenu"\nimport { StoryInsightsModal } from "./StoryInsightsModal"\n`);

if (!code.includes('const [ownerMenuOpen')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\);/,
    `const [showViewers, setShowViewers] = useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);`
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed use client and state');
