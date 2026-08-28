const fs = require('fs');
let code = fs.readFileSync('src/app/actions/social.ts', 'utf8');

const blockFunc = `
export async function blockUser(blockedUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if already blocked
  const { data: existing } = await supabase.from('blocks').select('*').eq('blocker_id', user.id).eq('blocked_id', blockedUserId).single()
  
  if (!existing) {
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: blockedUserId })
    // Remove follows in both directions
    await supabase.from('follows').delete().or(\`and(follower_id.eq.\${user.id},following_id.eq.\${blockedUserId}),and(follower_id.eq.\${blockedUserId},following_id.eq.\${user.id})\`)
  }
}
`;

if (!code.includes('export async function blockUser')) {
    code += blockFunc;
    fs.writeFileSync('src/app/actions/social.ts', code);
    console.log("ADDED BLOCK FUNCTION");
} else {
    console.log("ALREADY EXISTS");
}
