const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

code = code.replace(
  "body: content.trim() || null,",
  "body: content.trim() || null,\n        reply_to_id: replyingTo?.id || null,"
);

fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);
