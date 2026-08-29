"use server"

import { createClient } from "@/lib/supabase/server"

export async function getProfileHighlights(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('story_highlights')
    .select('id, name, cover_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlights:", error);
    return [];
  }
  return data;
}

export async function getHighlightStories(highlightId: string) {
  const supabase = await createClient()
  
  // We need to fetch the stories regardless of expiration.
  // The highlight_stories table links to stories.
  const { data, error } = await supabase
    .from('highlight_stories')
    .select('story_id, stories(*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path)))')
    .eq('highlight_id', highlightId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlight stories:", error);
    return [];
  }
  
  // Map back to just stories array, filtering nulls
  const stories = data.map(hs => hs.stories).filter(Boolean);
  return stories;
}
