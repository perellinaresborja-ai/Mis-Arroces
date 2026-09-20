"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getProfileHighlights(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('story_highlights')
    .select(`
      id, name, cover_url, user_id, sort_order,
      highlight_stories (
        story_id,
        display_order,
        stories (*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path)))
      )
    `)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlights:", error);
    return [];
  }
  return data.map(h => {
    const sortedHS = (h.highlight_stories || []).sort((a: any, b: any) => a.display_order - b.display_order);
    return {
      id: h.id,
      name: h.name,
      cover_url: h.cover_url,
      user_id: h.user_id,
      sort_order: h.sort_order ?? 0,
      stories: sortedHS.map((hs: any) => hs.stories).filter(Boolean)
    };
  });
}

export async function getHighlightStories(highlightId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('highlight_stories')
    .select('story_id, stories(*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path)))')
    .eq('highlight_id', highlightId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlight stories:", error);
    return [];
  }
  
  return data.map(hs => hs.stories).filter(Boolean);
}

export async function addStoryToHighlight(highlightId: string, storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized");
  
  // Verify ownership
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user.id) throw new Error("Unauthorized");

  // Get max display_order
  const { data: existing } = await supabase
    .from('highlight_stories')
    .select('display_order')
    .eq('highlight_id', highlightId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const nextOrder = existing ? existing.display_order + 1 : 0;
  
  const { error } = await supabase.from('highlight_stories').insert({
    highlight_id: highlightId,
    story_id: storyId,
    display_order: nextOrder
  });
  
  if (error && error.code !== '23505') {
    console.error(error);
    return false;
  }
  revalidatePath('/me')
  return true;
}

export async function createAndAddHighlight(name: string, storyId: string, coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Get max sort_order for user
  const { data: maxOrderRow } = await supabase
    .from('story_highlights')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = maxOrderRow ? (maxOrderRow.sort_order ?? 0) + 1 : 0;

  const { data: highlight, error } = await supabase.from('story_highlights').insert({
    user_id: user.id,
    name,
    cover_url: coverUrl,
    sort_order: nextSortOrder
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
  
  revalidatePath('/me')
  return highlight;
}

export async function updateHighlightsOrder(orderedHighlightIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify all highlights belong to current user
  const { data: userHighlights, error: fetchError } = await supabase
    .from('story_highlights')
    .select('id, user_id')
    .in('id', orderedHighlightIds);

  if (fetchError || !userHighlights) {
    throw new Error("Failed to fetch highlights for reordering");
  }

  // Ensure every highlight belongs to the authenticated user
  const unauthorized = userHighlights.some(h => h.user_id !== user.id);
  if (unauthorized || userHighlights.length !== orderedHighlightIds.length) {
    throw new Error("Unauthorized: you cannot reorder collections you do not own");
  }

  // Update sort_order for each highlight sequentially or in parallel
  const updatePromises = orderedHighlightIds.map((id, index) => 
    supabase
      .from('story_highlights')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updatePromises);
  const hasError = results.some(r => r.error);
  if (hasError) {
    console.error("Error updating highlights sort order", results.find(r => r.error));
    throw new Error("Failed to update sort order");
  }

  revalidatePath('/me');
  return true;
}

export async function editStoryHighlight(highlightId: string, name: string, storyIds: string[], coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const { data: h, error: hError } = await supabase
    .from('story_highlights')
    .select('id, user_id')
    .eq('id', highlightId)
    .single();
  if (hError || !h || h.user_id !== user.id) {
    throw new Error("Unauthorized: highlight not found or not owned");
  }

  // 1. Update highlight name and cover_url
  const updateData: { name: string; cover_url?: string } = { name };
  if (coverUrl) updateData.cover_url = coverUrl;
  const { error: updateError } = await supabase
    .from('story_highlights')
    .update(updateData)
    .eq('id', highlightId);
  if (updateError) throw updateError;

  // 2. Re-link highlight_stories safely preserving explicit manual order
  // NOTE: deleting from highlight_stories ONLY removes join records; original stories and media are never touched
  await supabase
    .from('highlight_stories')
    .delete()
    .eq('highlight_id', highlightId);

  if (storyIds.length > 0) {
    const newRelations = storyIds.map((storyId, idx) => ({
      highlight_id: highlightId,
      story_id: storyId,
      display_order: idx
    }));
    const { error: insertError } = await supabase
      .from('highlight_stories')
      .insert(newRelations);
    if (insertError) throw insertError;
  }

  revalidatePath('/me');
  return true;
}
