const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

code = code.replace(
  '      const { data: msg, error: insertError } = await supabase.from(\'messages\').insert({\n        conversation_id: conversationId,\n        sender_id: userData.user.id,\n        type: messageType,\n        body: content.trim() || null,\n        reply_to_id: replyingTo?.id || null,\n        entity_id: null\n      }).select().single()',
  '      const { data: msg, error: insertError } = await supabase.from(\'messages\').insert({\n        conversation_id: conversationId,\n        sender_id: userData.user.id,\n        type: messageType,\n        body: content.trim() || null,\n        reply_to_id: replyingTo?.id || null,\n        entity_id: null\n      } as any).select().single()'
);

fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);
