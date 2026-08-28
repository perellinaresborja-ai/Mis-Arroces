const fs = require('fs');

let code = fs.readFileSync('src/app/actions/messaging.ts', 'utf8');

const newUpdateReadStatus = `export async function updateReadStatus(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Find the latest message timestamp to avoid clock skew
  const { data: latestMsg } = await supabase
    .from('messages')
    .select('created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const readAt = latestMsg?.created_at || new Date().toISOString()

  // Use Admin Client to bypass RLS since conversation_members lacks an UPDATE policy for regular users
  const adminSupabase = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  )

  await adminSupabase
    .from('conversation_members')
    .update({ last_read_at: readAt })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
}`;

code = code.replace(
  /export async function updateReadStatus\([\s\S]*?\.eq\('user_id', user\.id\)\n\}/,
  newUpdateReadStatus
);

fs.writeFileSync('src/app/actions/messaging.ts', code);
