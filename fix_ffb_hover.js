const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedFollowButton.tsx', 'utf8');

code = code.replace(
  /<div className="relative" ref=\{menuRef\}>/,
  `<div className="relative" ref={menuRef} onMouseEnter={() => status === 'ACCEPTED' && setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>`
);

fs.writeFileSync('src/components/domain/FeedFollowButton.tsx', code);
