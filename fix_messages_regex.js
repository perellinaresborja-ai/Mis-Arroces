const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');

// We use regex to ignore newlines and spacing
code = code.replace(
  /className=\{`\$\{isRoot \? 'flex' : 'hidden'\} md:flex flex-col w-full md:w-\[350px\] shrink-0 border-r\s+border-border h-full`\}/g,
  "className={`${isRoot ? 'flex' : 'hidden'} flex-col w-full shrink-0 h-full`}"
);

code = code.replace(
  /className=\{`\$\{\!isRoot \? 'flex' : 'hidden'\} md:flex flex-col flex-1 min-h-0 h-full relative`\}/g,
  "className={`${!isRoot ? 'flex' : 'hidden'} flex-col flex-1 min-h-0 h-full relative`}"
);

fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', code);
console.log('Fixed MessagesLayoutClient properly');
