const fs = require('fs');
let content = fs.readFileSync('src/app/actions/social.ts', 'utf8');

const regex = /export async function toggleFollow[^}]*\}/g;
const match = content.match(regex);

if (match) {
  content = content.replace(regex, `export async function toggleFollow(targetUserId: string, isPrivate: boolean, currentStatus: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (currentStatus) {
    // Unfollow or cancel request
    await supabase.from("follows").delete().match({ follower_id: user.id, following_id: targetUserId })
  } else {
    // Follow
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
      status: isPrivate ? "PENDING" : "ACCEPTED"
    })
  }
  revalidatePath("/", "layout")
}`);
  fs.writeFileSync('src/app/actions/social.ts', content, 'utf8');
}
