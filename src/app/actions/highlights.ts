"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function extractStoryMediaPaths(story: any): string[] {
  if (!story) return [];
  const paths: string[] = [];
  if (story.story_media && Array.isArray(story.story_media)) {
    for (const sm of story.story_media) {
      const p = sm.media?.storage_path || sm.storage_path;
      if (p) paths.push(p);
    }
  }
  if (story.recipe?.recipe_media && Array.isArray(story.recipe.recipe_media)) {
    for (const rm of story.recipe.recipe_media) {
      const p = rm.media?.storage_path || rm.storage_path;
      if (p) paths.push(p);
    }
  }
  if (story.session?.session_media && Array.isArray(story.session.session_media)) {
    for (const sm of story.session.session_media) {
      const p = sm.media?.storage_path || sm.storage_path;
      if (p) paths.push(p);
    }
  }
  return paths;
}

function resolveStoryCoverUrl(story: any): string | null {
  if (!story) return null;
  const paths = extractStoryMediaPaths(story);
  if (paths.length > 0) {
    const firstPath = paths[0];
    if (firstPath.startsWith('http')) return firstPath;
    return `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${firstPath}`;
  }
  return null;
}

export async function getProfileHighlights(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('story_highlights')
    .select(`
      id, name, cover_url, user_id, sort_order,
      highlight_stories (
        story_id,
        display_order,
        stories (
          *,
          author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
          story_media(media_id, media:media_assets(storage_path)),
          recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
          session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
        )
      )
    `)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlights:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Generate signed URLs for highlight stories media using SERVICE_ROLE
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminSupabase = serviceKey
    ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
        serviceKey
      )
    : null;

  if (adminSupabase) {
    for (const h of data) {
      for (const hs of (h.highlight_stories || [])) {
        const story = hs.stories;
        if (!story) continue;
        if (story.story_media && story.story_media.length > 0) {
          const path = story.story_media[0].media?.storage_path;
          if (path) {
            const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(path, 3600);
            if (signed) {
              (story.story_media[0].media as any).signed_url = signed.signedUrl;
            }
          }
        }
        if (story.recipe?.recipe_media && story.recipe.recipe_media.length > 0) {
          const rPath = story.recipe.recipe_media[0].media?.storage_path;
          if (rPath) {
            const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(rPath, 3600);
            if (signed) {
              (story.recipe.recipe_media[0].media as any).signed_url = signed.signedUrl;
            }
          }
        }
        if (story.session?.session_media && story.session.session_media.length > 0) {
          const sPath = story.session.session_media[0].media?.storage_path;
          if (sPath) {
            const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(sPath, 3600);
            if (signed) {
              (story.session.session_media[0].media as any).signed_url = signed.signedUrl;
            }
          }
        }
      }
    }
  }

  const cleanedHighlights = [];
  const dbClient = adminSupabase || supabase;

  for (const h of data) {
    // 1. Filtrar solo historias que existan realmente (no eliminadas)
    const validHS = (h.highlight_stories || [])
      .filter((hs: any) => hs && hs.stories && !hs.stories.deleted_at)
      .sort((a: any, b: any) => a.display_order - b.display_order);

    const validStories = validHS.map((hs: any) => hs.stories);

    // 2. Si no quedan historias válidas, eliminar el destacado huérfano de la BD y no mostrarlo
    if (validStories.length === 0) {
      await dbClient.from('story_highlights').delete().eq('id', h.id);
      continue;
    }

    // 3. Comprobar si la portada actual corresponde a alguna historia válida existente
    const allValidPaths = validStories.flatMap(extractStoryMediaPaths);
    let isCoverValid = false;

    if (h.cover_url) {
      for (const p of allValidPaths) {
        const fn = p.split('/').pop();
        if (h.cover_url.includes(p) || (fn && h.cover_url.includes(fn))) {
          isCoverValid = true;
          break;
        }
      }
    }

    // 4. Si la portada era de una Story eliminada (o es inválida), recalcularla automáticamente
    let effectiveCoverUrl = h.cover_url;
    if (!isCoverValid) {
      let newCoverUrl: string | null = null;
      for (const st of validStories) {
        newCoverUrl = resolveStoryCoverUrl(st);
        if (newCoverUrl) break;
      }

      effectiveCoverUrl = newCoverUrl;

      // Autosanar en base de datos para que quede arreglado definitivamente
      await dbClient
        .from('story_highlights')
        .update({ cover_url: newCoverUrl })
        .eq('id', h.id);
    }

    cleanedHighlights.push({
      id: h.id,
      name: h.name,
      cover_url: effectiveCoverUrl,
      user_id: h.user_id,
      sort_order: h.sort_order ?? 0,
      stories: validStories
    });
  }

  return cleanedHighlights;
}

export async function getHighlightStories(highlightId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('highlight_stories')
    .select(`
      story_id,
      stories(
        *,
        author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        story_media(media_id, media:media_assets(storage_path)),
        recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
        session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
      )
    `)
    .eq('highlight_id', highlightId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error("Error fetching highlight stories:", error);
    return [];
  }
  
  const stories = data.map(hs => hs.stories).filter(Boolean);

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && stories.length > 0) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    );
    for (const story of stories) {
      if (story.story_media && story.story_media.length > 0) {
        const path = story.story_media[0].media?.storage_path;
        if (path) {
          const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(path, 3600);
          if (signed) {
            (story.story_media[0].media as any).signed_url = signed.signedUrl;
          }
        }
      }
      if (story.recipe?.recipe_media && story.recipe.recipe_media.length > 0) {
        const rPath = story.recipe.recipe_media[0].media?.storage_path;
        if (rPath) {
          const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(rPath, 3600);
          if (signed) {
            (story.recipe.recipe_media[0].media as any).signed_url = signed.signedUrl;
          }
        }
      }
      if (story.session?.session_media && story.session.session_media.length > 0) {
        const sPath = story.session.session_media[0].media?.storage_path;
        if (sPath) {
          const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(sPath, 3600);
          if (signed) {
            (story.session.session_media[0].media as any).signed_url = signed.signedUrl;
          }
        }
      }
    }
  }

  return stories;
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

  // Si no quedan historias seleccionadas, eliminar el destacado
  if (storyIds.length === 0) {
    await supabase
      .from('story_highlights')
      .delete()
      .eq('id', highlightId);

    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    revalidatePath('/', 'layout');
    revalidatePath('/me');
    if (profile?.username) {
      revalidatePath(`/@${profile.username}`);
      revalidatePath(`/${profile.username}`);
    }
    revalidatePath('/[userParam]', 'page');
    return true;
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

  const newRelations = storyIds.map((storyId, idx) => ({
    highlight_id: highlightId,
    story_id: storyId,
    display_order: idx
  }));
  const { error: insertError } = await supabase
    .from('highlight_stories')
    .insert(newRelations);
  if (insertError) throw insertError;

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  revalidatePath('/', 'layout');
  revalidatePath('/me');
  if (profile?.username) {
    revalidatePath(`/@${profile.username}`);
    revalidatePath(`/${profile.username}`);
  }
  revalidatePath('/[userParam]', 'page');
  return true;
}
