const fs = require('fs');
let code = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');

code = code.replace(
  /else if \(notif\.type === 'FOLLOW' \|\| notif\.type === 'FOLLOW_ACCEPT'\) \{\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*\}/,
  `else if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_ACCEPT') {
        const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;
        router.push(url);
      }`
);

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', code);
console.log('Fixed FOLLOW notification routing');
