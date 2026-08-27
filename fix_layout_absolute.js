const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');

code = code.replace(
  'className="flex h-[100dvh] md:h-[calc(100vh-64px)] w-full max-w-6xl mx-auto overflow-hidden bg-background"',
  'className="absolute inset-0 md:inset-x-8 flex overflow-hidden bg-background"'
);

fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', code);
