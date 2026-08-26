const fs = require('fs');
let f = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');
f = f.replace(/10'\}\`\}\`/g, "10'}`}"); // maybe it has two
f = f.replace(/10'\}`\}`/g, "10'}`}");
fs.writeFileSync('src/components/domain/NotificationPanel.tsx', f, 'utf8');
