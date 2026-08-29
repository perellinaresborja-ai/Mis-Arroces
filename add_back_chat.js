const fs = require('fs');

let code = fs.readFileSync('src/app/messages/[conversationId]/page.tsx', 'utf8');

if (!code.includes('BackButton')) {
  code = `import { BackButton } from "@/components/domain/BackButton"\n` + code;
  code = code.replace(
    /<div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0 sticky top-0 z-10">/,
    `<div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0 sticky top-0 z-10">
        <div className="md:hidden"><BackButton /></div>`
  );
  fs.writeFileSync('src/app/messages/[conversationId]/page.tsx', code);
  console.log('Added BackButton to chat page');
}
