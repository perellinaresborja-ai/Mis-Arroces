const fs = require('fs');
let f = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');
f = f.replace(/10'\}\\\}/g, "10'}`}").replace(/10'\}\\\`\}/g, "10'}`}").replace(/10'\}\\\`\}\`/g, "10'}`}");
// just force it:
f = f.replace(/className=\{\`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors \$\\\{notif\.is_read \? 'hover:bg-muted\/50' : 'bg-primary\/5 hover:bg-primary\/10'\\\}\\\`\}/g, "className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${notif.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}");
// Just completely rewrite the mapped portion to be safe
const toReplace = `          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={\`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors \${notif.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}\`}
            >`;
            
const safeStr = "          notifications.map(notif => (\n            <div \n              key={notif.id} \n              onClick={() => handleNotificationClick(notif)}\n              className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${notif.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}\n            >";

// We'll just regex replace className line completely
f = f.replace(/className=\{\`flex items-start gap-3.*?\}/g, "className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${notif.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}");

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', f, 'utf8');
