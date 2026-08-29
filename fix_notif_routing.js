const fs = require('fs');

let code = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');

code = code.replace(
  /else if \(notif\.type === 'FOLLOW' \|\| notif\.type === 'FOLLOW_ACCEPT'\) \{\n\s*const url = notif\.actor\?\.username \? `\/@\$\{notif\.actor\.username\}` : `\/\$\{notif\.actor\?\.id\}`;\n\s*router\.push\(url\);\n\s*\}/,
  `else if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_ACCEPT') {
        // The user requested that we do not open the profile page when clicking "started following you".
        // Just marking it as read is enough.
      }`
);

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', code);
console.log('Fixed NotificationPanel');
