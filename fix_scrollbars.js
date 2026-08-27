const fs = require('fs');

let cc = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');
cc = cc.replace(
  'className="flex-1 overflow-y-auto flex flex-col relative pb-32"',
  'className="flex-1 overflow-y-auto flex flex-col relative pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"'
);
fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', cc);

let layout = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');
layout = layout.replace(
  'className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4"',
  'className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"'
);
fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', layout);
