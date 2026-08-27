const fs = require('fs');
let code = fs.readFileSync('src/app/actions/messaging.ts', 'utf8');

code = code.replace(
  ".select('*, message_attachments(storage_path)')",
  ".select('*, message_attachments(storage_path), parent:messages!messages_reply_to_id_fkey(type, body, content)')"
);

fs.writeFileSync('src/app/actions/messaging.ts', code);
