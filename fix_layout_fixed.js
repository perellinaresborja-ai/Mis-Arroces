const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');

code = code.replace(
  'className="absolute inset-0 md:inset-x-8 flex overflow-hidden bg-background"',
  'className="fixed inset-0 md:top-[64px] flex w-full max-w-7xl mx-auto overflow-hidden bg-background z-40"'
);

fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', code);
