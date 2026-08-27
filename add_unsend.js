const fs = require('fs');

let code = fs.readFileSync('src/app/actions/messaging.ts', 'utf8');

if (!code.includes('unsendMessage')) {
  code += `
export async function unsendMessage(messageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
`;
  fs.writeFileSync('src/app/actions/messaging.ts', code);
}
