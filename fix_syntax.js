const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const target = `  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: \`Respuesta a tu pregunta "\${question}": \${answer}\`,
      message_type: 'STORY_REPLY',
      metadata: { story_id: storyId }
    })
  }
}`;

code = code.replace(target, '');
fs.writeFileSync('src/app/actions/stories.ts', code);
