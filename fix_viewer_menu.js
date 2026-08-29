const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Replace handleMenuClick to use ownerMenuOpen
code = code.replace(
  /const handleMenuClick = \(e: React\.MouseEvent\) => \{\s*e\.stopPropagation\(\);\s*setIsPaused\(true\);\s*setShowMenu\(true\);\s*\}/,
  `const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsPaused(true);
      if (isMe) {
        setOwnerMenuOpen(true);
      } else {
        setShowMenu(true);
      }
    }`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed handleMenuClick');
