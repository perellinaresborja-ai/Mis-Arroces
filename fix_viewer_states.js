const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (!code.includes('const [ownerMenuOpen')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\);?/g,
    `const [showViewers, setShowViewers] = useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);`
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed states');
