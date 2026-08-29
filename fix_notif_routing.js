const fs = require('fs');
let code = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');

code = code.replace(
  /const url = notif\.actor\?\.username \? \`\/@\$\{notif\.actor\.username\}\` : \`\/\$\{notif\.actor\?\.id\}\`;/,
  "const url = `/profile`;"
);

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', code);
console.log('Fixed notification routing JS');
