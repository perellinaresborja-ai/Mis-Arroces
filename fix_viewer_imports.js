const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Ensure imports
if (!code.includes('import { StoryOwnerMenu }')) {
  code = `import { StoryOwnerMenu } from "./StoryOwnerMenu"\nimport { StoryInsightsModal } from "./StoryInsightsModal"\n` + code;
}

if (!code.includes('const [ownerMenuOpen')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\);/,
    `const [showViewers, setShowViewers] = useState(false);\n  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);\n  const [highlightModalOpen, setHighlightModalOpen] = useState(false);`
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

let menuCode = fs.readFileSync('src/components/domain/StoryOwnerMenu.tsx', 'utf8');
menuCode = menuCode.replace(/import \{ toast \} from "react-hot-toast"/, '');
menuCode = menuCode.replace(/toast\.success\([^)]+\)/g, 'alert("Éxito")');
menuCode = menuCode.replace(/toast\.error\([^)]+\)/g, 'alert("Error")');

fs.writeFileSync('src/components/domain/StoryOwnerMenu.tsx', menuCode);

console.log('Fixed imports and toast');
