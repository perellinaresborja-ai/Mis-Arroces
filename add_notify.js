const fs = require('fs');
let code = fs.readFileSync('src/app/actions/messaging.ts', 'utf8');
code += `
export async function notifyNewMessage(conversationId: string, messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: members } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id);
  
  if (members && members.length > 0) {
    await createNotification(members[0].user_id, 'NEW_MESSAGE', conversationId, user.id, { message_id: messageId });
  }
}
`;
fs.writeFileSync('src/app/actions/messaging.ts', code);
