const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const reactionCode = `
export async function toggleStoryReaction(storyId: string, reaction: string) {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Find owner to notify
  const { data: story } = await supabase.from("stories").select("owner_id").eq("id", storyId).single()

  const { data: existing } = await supabase.from("story_reactions").select("id, reaction").eq("story_id", storyId).eq("user_id", user.id).single()

  if (existing && existing.reaction === reaction) {
    await supabase.from("story_reactions").delete().eq("id", existing.id)
    return { success: true, action: 'removed' }
  }

  await supabase.from("story_reactions").upsert({
    story_id: storyId,
    user_id: user.id,
    reaction
  }, { onConflict: "story_id, user_id" })

  if (story && story.owner_id !== user.id) {
    const { createNotification } = await import("@/app/actions/notifications");
    await createNotification(story.owner_id, 'REACTION', 'story', storyId, { reaction });
  }

  return { success: true, action: 'added' }
}
`;

code += `\n${reactionCode}`;
fs.writeFileSync('src/app/actions/stories.ts', code);
console.log("ADDED TOGGLE REACTION");
