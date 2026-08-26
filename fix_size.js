const fs = require('fs');
let f = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');
f = f.replace(/size="sm"/g, "");
fs.writeFileSync('src/components/domain/NotificationPanel.tsx', f, 'utf8');
