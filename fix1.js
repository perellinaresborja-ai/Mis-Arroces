const fs = require('fs');

let actions = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
actions += `
export async function upsertSliderValue(storyId: string, overlayId: string, value: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if (value < 0 || value > 100) throw new Error("Invalid value");

  const { data: story } = await supabase.from('stories').select('owner_id, expires_at').eq('id', storyId).single();
  if (!story) throw new Error("Story not found");
  if (new Date(story.expires_at) < new Date()) throw new Error("Story expirada");

  const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: story.owner_id });
  if (isBlocked) throw new Error("Action denied");

  const { error } = await supabase.from('story_slider_responses').upsert({
    story_id: storyId, overlay_id: overlayId, user_id: user.id, value, updated_at: new Date().toISOString()
  }, { onConflict: 'overlay_id,user_id' });
  if (error) throw error; return true;
}
export async function getSliderResults(overlayId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: votes, error } = await supabase.from('story_slider_responses').select('value, user_id').eq('overlay_id', overlayId);
  if (error) throw error;
  let total = 0; let count = votes.length; let myValue = null;
  votes.forEach(v => { total += v.value; if (user && v.user_id === user.id) myValue = v.value; });
  return { average: count > 0 ? Math.round(total / count) : 0, count, myValue };
}
`;
fs.writeFileSync('src/app/actions/stories.ts', actions);
