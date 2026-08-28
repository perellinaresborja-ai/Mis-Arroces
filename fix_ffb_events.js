const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedFollowButton.tsx', 'utf8');

// Replace mousedown with pointerdown, maybe it's cleaner
code = code.replace(/"mousedown"/g, '"pointerdown"');

fs.writeFileSync('src/components/domain/FeedFollowButton.tsx', code);
