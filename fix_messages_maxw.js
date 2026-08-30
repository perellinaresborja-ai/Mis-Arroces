const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');

code = code.replace(
  'max-w-7xl mx-auto',
  'max-w-5xl mx-auto border-x border-border/50'
);

fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', code);
console.log('Fixed max-w in MessagesLayoutClient');
