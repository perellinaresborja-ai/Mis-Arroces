const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

code = code.replace(
  "const mediaUrl = mEntityId ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${mEntityId}` : null",
  `const attachment = (message.message_attachments as any[])?.[0];
  const attachmentPath = attachment?.storage_path;
  const mediaUrl = attachmentPath ? \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/\${attachmentPath}\` : null;`
);

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);
