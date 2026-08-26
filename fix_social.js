const fs = require('fs');

let file = fs.readFileSync('src/app/actions/social.ts', 'utf8');

if (!file.includes('createNotification')) {
  file = file.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { createNotification } from "@/app/actions/notifications"'
  );
}

const followRegex = /export async function toggleFollow\([\s\S]*?\}\n/g;
let newFile = file.replace(followRegex, (match) => {
  return `export async function toggleFollow(targetUserId: string, isPrivate: boolean, currentStatus: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (currentStatus) {
    await supabase.from("follows").delete().match({ follower_id: user.id, following_id: targetUserId })
  } else {
    const status = isPrivate ? "PENDING" : "ACCEPTED"
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
      status
    })
    
    await createNotification(
      targetUserId, 
      status === "PENDING" ? 'FOLLOW_REQUEST' : 'FOLLOW', 
      'profile', 
      user.id
    )
  }
  revalidatePath("/discover")
  revalidatePath("/", "layout")
}
`;
});

// Add acceptFollow action
newFile += `
export async function acceptFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("follows")
    .update({ status: 'ACCEPTED' })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  await createNotification(followerId, 'FOLLOW_ACCEPT', 'profile', user.id)
  revalidatePath("/profile/requests")
}

export async function rejectFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("follows")
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  revalidatePath("/profile/requests")
}
`;

fs.writeFileSync('src/app/actions/social.ts', newFile, 'utf8');
