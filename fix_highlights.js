const fs = require('fs');

let code = fs.readFileSync('src/app/actions/highlights.ts', 'utf8');

code += `\n
export async function addStoryToHighlight(highlightId: string, storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized");
  
  // Verify ownership
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user.id) throw new Error("Unauthorized");

  // Get max display_order
  const { data: existing } = await supabase.from('highlight_stories').select('display_order').eq('highlight_id', highlightId).order('display_order', { ascending: false }).limit(1).maybeSingle();
  
  const nextOrder = existing ? existing.display_order + 1 : 0;
  
  // Insert (ON CONFLICT DO NOTHING relies on unique constraint, but we can just use insert and catch error)
  const { error } = await supabase.from('highlight_stories').insert({
    highlight_id: highlightId,
    story_id: storyId,
    display_order: nextOrder
  });
  
  if (error && error.code !== '23505') { // Ignore unique violation if already added
    console.error(error);
    return false;
  }
  return true;
}

export async function createAndAddHighlight(name: string, storyId: string, coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: highlight, error } = await supabase.from('story_highlights').insert({
    user_id: user.id,
    name,
    cover_url: coverUrl
  }).select().single();
  
  if (error) {
    console.error(error);
    return null;
  }
  
  await supabase.from('highlight_stories').insert({
    highlight_id: highlight.id,
    story_id: storyId,
    display_order: 0
  });
  
  return highlight;
}
`;

fs.writeFileSync('src/app/actions/highlights.ts', code);
console.log('Fixed highlights actions');
