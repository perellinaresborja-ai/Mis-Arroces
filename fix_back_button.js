const fs = require('fs');
let code = fs.readFileSync('src/app/messages/[conversationId]/page.tsx', 'utf8');

code = code.replace(
  '<div className="md:hidden"><BackButton /></div>',
  '<div><BackButton /></div>'
);

fs.writeFileSync('src/app/messages/[conversationId]/page.tsx', code);
console.log('Fixed BackButton visibility');
