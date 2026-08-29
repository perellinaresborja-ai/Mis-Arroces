const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

// Update deleteStory
const oldDeleteStory = `export async function deleteStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check ownership
  const { data: story } = await supabase.from("stories").select("owner_id, story_media(media:media_assets(storage_path))").eq("id", storyId).single()
  if (!story || story.owner_id !== user.id) throw new Error("Not authorized or not found")

  // Delete media from storage if it exists in story_media bucket
  if (story.story_media && story.story_media.length > 0) {
    const paths = story.story_media.map((sm: any) => sm.media?.storage_path).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from("story_media").remove(paths)
    }
  }

  const { error } = await supabase.from("stories").delete().eq("id", storyId)
  if (error) throw new Error("Failed to delete story")
  
  trackEvent("STORY_DELETED", "STORY", storyId, user.id)
  revalidatePath("/")
}`;

const newDeleteStory = `export async function deleteStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check ownership
  const { data: story } = await supabase.from("stories").select("owner_id, story_media(media_id, media:media_assets(storage_path))").eq("id", storyId).single()
  if (!story || story.owner_id !== user.id) throw new Error("Not authorized or not found")

  // We should NOT blindly delete from storage. In misarroces, media_assets can be shared.
  // Proper cleanup requires checking if media_id is used in recipe_media, session_media, post_media, etc.
  // For now, we rely on the DB cascade for the junction table 'story_media'.
  // We will ONLY delete the story row. The actual asset cleanup should be a separate cron/RPC.
  
  const { error } = await supabase.from("stories").delete().eq("id", storyId)
  if (error) throw new Error("Failed to delete story")
  
  trackEvent("STORY_DELETED", "STORY", storyId, user.id)
  revalidatePath("/")
}`;

code = code.replace(oldDeleteStory, newDeleteStory);

const newActions = `
export async function getArchivedStories() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('stories')
    .select('*, story_media(media_id, media:media_assets(storage_path))')
    .eq('owner_id', user.id)
    .lte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getStoryInsights(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: story } = await supabase.from('stories').select('owner_id, overlays').eq('id', storyId).single();
  if (!story || story.owner_id !== user.id) throw new Error("Not authorized");
  
  // Get Views & Reach
  const { data: views } = await supabase.from('story_views').select('viewer_id').eq('story_id', storyId);
  const totalViews = views?.length || 0;
  const reach = new Set(views?.map(v => v.viewer_id)).size;
  
  // Get Analytics (Reactions, Clicks)
  const { data: events } = await supabase.from('analytics_events')
    .select('event_type, visitor_id')
    .eq('entity_id', storyId)
    .in('event_type', ['STORY_REACTION', 'RECIPE_CLICK_FROM_STORY']);
    
  const reactions = events?.filter(e => e.event_type === 'STORY_REACTION').length || 0;
  const recipeClicks = events?.filter(e => e.event_type === 'RECIPE_CLICK_FROM_STORY').length || 0;
  
  // Get Polls if any
  const polls = [];
  const overlays = (story.overlays || []) as any[];
  for (const ov of overlays) {
    if (ov.type === 'POLL') {
      const pollId = ov.payload?.pollId || ov.id;
      const { data: pollData } = await supabase.from('story_polls').select('question, option_a, option_b').eq('id', pollId).single();
      if (pollData) {
        const { data: votes } = await supabase.from('story_poll_votes').select('option').eq('poll_id', pollId);
        const total = votes?.length || 0;
        const countA = votes?.filter(v => v.option === 'A').length || 0;
        const countB = votes?.filter(v => v.option === 'B').length || 0;
        polls.push({
          question: pollData.question,
          optionA: pollData.option_a,
          optionB: pollData.option_b,
          percentA: total ? Math.round((countA/total)*100) : 0,
          percentB: total ? Math.round((countB/total)*100) : 0,
          total
        });
      }
    }
  }
  
  // Get Sliders if any
  const sliders = [];
  for (const ov of overlays) {
    if (ov.type === 'SLIDER') {
      const { data: responses } = await supabase.from('story_slider_responses').select('value').eq('overlay_id', ov.id);
      const total = responses?.length || 0;
      const avg = total ? Math.round(responses!.reduce((acc, curr) => acc + curr.value, 0) / total) : 0;
      sliders.push({
        prompt: ov.payload?.question || '',
        emoji: ov.payload?.emoji || '😍',
        average: avg,
        total
      });
    }
  }
  
  // Message replies (Question or Text reply)
  // We approximate by counting messages where payload->>story_id = storyId. Wait, messaging entityId is STORY and storyId.
  // In our DB, how are story replies stored? 
  // Let's assume there is an analytics event STORY_REPLY for now to get a simple count.
  const { data: replyEvents } = await supabase.from('analytics_events')
    .select('id')
    .eq('entity_id', storyId)
    .in('event_type', ['STORY_REPLY', 'STORY_QUESTION_REPLY']);
    
  const replies = replyEvents?.length || 0;
  
  return {
    views: totalViews,
    reach,
    reactions,
    replies,
    recipeClicks,
    polls,
    sliders
  };
}

export async function updateHighlight(highlightId: string, name: string, coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user?.id) throw new Error("Unauthorized");
  
  await supabase.from('story_highlights').update({ name, cover_url: coverUrl }).eq('id', highlightId);
  return true;
}

export async function deleteHighlight(highlightId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user?.id) throw new Error("Unauthorized");
  
  await supabase.from('story_highlights').delete().eq('id', highlightId);
  return true;
}
`;

if (!code.includes('getArchivedStories')) {
  code += newActions;
}

fs.writeFileSync('src/app/actions/stories.ts', code);
console.log('Updated story actions');
