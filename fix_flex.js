const fs = require('fs');

let layout = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');
layout = layout.replace(
  "className={`${!isRoot ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full relative`}",
  "className={`${!isRoot ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0 h-full relative`}"
);
fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', layout);

let chat = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');
chat = chat.replace(
  'className="flex flex-col flex-1 h-full relative"',
  'className="flex flex-col flex-1 min-h-0 h-full relative"'
);
fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', chat);
