const fs = require('fs');

let cc = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

cc = cc.replace('const supabase = createClient()', '');
cc = cc.replace(
  'const mediaUrl = attachmentPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${attachmentPath}` : null;',
  'const mediaUrl = attachmentPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${attachmentPath}` : null;\n  const supabase = createClient();'
);

cc = cc.replace(
  /.eq\('message_id', message.id\)/g,
  ".eq('message_id', message.id as string)"
);

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', cc);
