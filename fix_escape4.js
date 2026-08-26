const fs = require('fs');
let f = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');
f = f.replace(/10'\}\`\}\}/g, "10'}`}"); // replace `}}` with `}`
fs.writeFileSync('src/components/domain/NotificationPanel.tsx', f, 'utf8');
