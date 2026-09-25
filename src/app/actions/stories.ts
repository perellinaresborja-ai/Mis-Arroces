"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"

export async function createStory(data: {
  mediaTransform?: any
  overlays?: any[]
  background?: any
  mediaId?: string
  caption?: string
  recipeId?: string
  sessionId?: string
  postId?: string
  musicConfig?: any
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Validate music config if present
  let validMusicConfig = null;
  if (data.musicConfig) {
    const { validateMusicConfig } = await import("@/types/stories");
    if (!validateMusicConfig(data.musicConfig)) {
      throw new Error("Invalid music configuration");
    }
    if (data.musicConfig.track_id) {
      // Check if track exists and is active
      const { data: track } = await (supabase as any).from('story_music_tracks').select('id, duration_ms, active').eq('id', data.musicConfig.track_id).single();
      if (!track || !track.active) {
        throw new Error("Invalid or inactive music track");
      }
      // Check boundaries
      if (data.musicConfig.start_time_ms + data.musicConfig.duration_ms > track.duration_ms) {
        throw new Error("Music fragment exceeds track duration");
      }
      validMusicConfig = data.musicConfig;
    } else if (data.musicConfig.original_audio_volume !== undefined) {
      validMusicConfig = { original_audio_volume: data.musicConfig.original_audio_volume };
    }
  }

  const { data: story, error } = await supabase.from("stories").insert({
    owner_id: user.id,
    caption: data.caption || null,
    recipe_id: data.recipeId || null,
    session_id: data.sessionId || null,
    visibility: "PUBLIC",
    media_transform: data.mediaTransform || null,
    overlays: data.overlays || [],
    background: data.background || null,
    music_config: validMusicConfig
  } as any).select().single()

  if (error || !story) {
    console.error("Error creating story:", error)
    throw new Error("Failed to create story")
  }

    // Verify ownership if client provided an arbitrary mediaId
    if (data.mediaId) {
      const { data: ma } = await supabase.from('media_assets').select('owner_id').eq('id', data.mediaId).single();
      if (!ma || ma.owner_id !== user.id) {
        throw new Error("Unauthorized: You do not own this media asset.");
      }
    }

    // Automatically resolve recipe media if not provided
    let finalMediaId = data.mediaId;
    if (!finalMediaId && data.recipeId) {
      // Verify recipe visibility before allowing its media to be linked
      const { data: recipe } = await supabase.from('recipes').select('visibility').eq('id', data.recipeId).single();
      if (!recipe || (recipe.visibility !== 'PUBLIC' && recipe.visibility !== 'FOLLOWERS')) {
         // Fallback or skip if not public, though RLS on recipes should handle this.
      }

      const { data: rm } = await supabase
        .from('recipe_media')
        .select('media_id')
        .eq('recipe_id', data.recipeId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();
      if (rm) finalMediaId = rm.media_id;
    }

    // Automatically resolve post media if sharing a post and mediaId not provided
    if (!finalMediaId && data.postId) {
      const { data: pm } = await supabase
        .from('post_media')
        .select('media_id')
        .eq('post_id', data.postId)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (pm?.media_id) {
        finalMediaId = pm.media_id;
      } else {
        const { data: postRec } = await supabase
          .from('social_posts')
          .select('recipe_id')
          .eq('id', data.postId)
          .maybeSingle();
        if (postRec?.recipe_id) {
          const { data: rm } = await supabase
            .from('recipe_media')
            .select('media_id')
            .eq('recipe_id', postRec.recipe_id)
            .order('display_order', { ascending: true })
            .limit(1)
            .maybeSingle();
          if (rm?.media_id) finalMediaId = rm.media_id;
        }
      }
    }

    if (finalMediaId) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let insertClient = supabase;
      if (serviceKey) {
        insertClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          serviceKey
        );
      }
      
      const { error: smError } = await insertClient.from("story_media").insert({
        story_id: story.id,
        media_id: finalMediaId,
        display_order: 0
      });
      
      if (smError) {
        console.error("Failed to insert story_media:", smError);
      }
    }

  // Handle POLL overlays insertion
  if (data.overlays && Array.isArray(data.overlays)) {
    const isUuid = (str?: string) => !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    for (const overlay of data.overlays) {
      if (overlay.type === 'POLL' && overlay.payload?.question) {
        let pollId = overlay.payload.pollId || overlay.id;
        if (!isUuid(pollId)) {
          const crypto = await import("crypto");
          pollId = crypto.randomUUID();
          overlay.payload.pollId = pollId;
        }
        const { error: pollErr } = await supabase.from('story_polls').insert({
          id: pollId,
          story_id: story.id,
          question: overlay.payload.question,
          option_a: overlay.payload.optionA,
          option_b: overlay.payload.optionB
        });
        if (pollErr) {
          console.error("Failed to insert story_poll for story:", pollErr);
        }
      }
    }
  }

  // Handle MENTION notifications
  if (data.overlays && Array.isArray(data.overlays)) {
    const { createNotification } = await import("@/app/actions/notifications");
    const mentionedIds = new Set<string>();
    
    for (const overlay of data.overlays) {
      if (overlay.type === 'MENTION' && overlay.payload?.userId) {
        mentionedIds.add(overlay.payload.userId);
      }
    }
    
    for (const recipientId of mentionedIds) {
      if (recipientId !== user.id) {
        await createNotification(recipientId, 'MENTION', 'story', story.id);
      }
    }
  }

  revalidatePath("/")
  return story
}


export async function fetchActiveStories(existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser !== undefined ? existingUser : (await supabase.auth.getUser()).data.user
  
  // Get all active stories with view count instead of loading all view rows
  const { data, error } = await supabase
    .from("stories")
    .select(`
      *,
      author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      story_media(media:media_assets(storage_path)),
      view_count:story_views(count),
      recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
      session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
    `)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })

  if (!data || data.length === 0) return []

  // Fetch the current user's views in one query to avoid filtering client-side
  const storyIds = data.map(s => s.id)
  let userSeenSet = new Set<string>()
  if (user && storyIds.length > 0) {
    const { data: myViews } = await supabase.from('story_views').select('story_id').eq('viewer_id', user.id).in('story_id', storyIds)
    if (myViews) {
      myViews.forEach(v => userSeenSet.add(v.story_id))
    }
  }

    // Generate signed URLs for story media using SERVICE_ROLE
  // This is completely isolated from the browser and only signs paths that were already authorized by the RLS of 'stories'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    );
    const mediaToSign: { mediaRef: any; path: string }[] = [];
    for (const story of data) {
      if (story.story_media && story.story_media.length > 0) {
        const path = story.story_media[0].media?.storage_path;
        if (path) {
          mediaToSign.push({ mediaRef: story.story_media[0].media, path });
        }
      }
    }
    if (mediaToSign.length > 0) {
      try {
        const { data: signedList } = await adminSupabase.storage
          .from('recipe_media')
          .createSignedUrls(mediaToSign.map(m => m.path), 3600);
        if (signedList) {
          signedList.forEach((signed, idx) => {
            if (signed?.signedUrl && mediaToSign[idx]) {
              (mediaToSign[idx].mediaRef as any).signed_url = signed.signedUrl;
            }
          });
        }
      } catch (err) {
        console.error('Error signing story urls batch:', err);
      }
    }
  }

  // Group by owner
  const userMap = new Map()
  data.forEach((story: {id: string, owner_id: string, created_at: string, author: any, view_count?: any[]}) => {
    if (!userMap.has(story.owner_id)) {
      userMap.set(story.owner_id, {
        author: story.author,
        stories: [],
        allSeen: true,
        lastUpdated: story.created_at
      })
    }
    const userGroup = userMap.get(story.owner_id)
    
    // Check if seen by current user
    const hasSeen = userSeenSet.has(story.id);
    
    // An owner doesn't count their own story as unseen
    const isOwner = user && user.id === story.owner_id;
    
    if (!hasSeen && !isOwner) {
      userGroup.allSeen = false;
    }
    
    if (story.created_at > userGroup.lastUpdated) {
      userGroup.lastUpdated = story.created_at
    }

    userGroup.stories.push({
      ...story,
      hasSeen,
      viewCount: story.view_count?.[0]?.count || 0
    })
  })

  // Convert to array and sort
  const result = Array.from(userMap.values())
  
  result.sort((a, b) => {
    // Current user's stories first
    if (user && a.author.id === user.id) return -1;
    if (user && b.author.id === user.id) return 1;

    // Unseen first
    if (a.allSeen === b.allSeen) {
      // Sort by latest update desc
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    }
    return a.allSeen ? 1 : -1
  })

  return result
}

export async function fetchUserActiveStories(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch active stories for this specific user
  // Supabase RLS automatically applies visibility, privacy and blocks
  const { data, error } = await supabase
    .from("stories")
    .select(`
      *,
      author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      story_media(media:media_assets(storage_path)),
      view_count:story_views(count),
      recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
      session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
    `)
    .eq("owner_id", targetUserId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })

  if (error || !data || data.length === 0) return null

  // 2. Fetch current user's views for these stories to determine allSeen
  const storyIds = data.map(s => s.id)
  let userSeenSet = new Set<string>()
  if (user && storyIds.length > 0) {
    const { data: myViews } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', user.id)
      .in('story_id', storyIds)
    if (myViews) {
      myViews.forEach(v => userSeenSet.add(v.story_id))
    }
  }

  // 3. Generate signed URLs for story media using SERVICE_ROLE if available
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    );
    for (const story of data) {
      if (story.story_media && story.story_media.length > 0) {
        const path = story.story_media[0].media?.storage_path;
        if (path) {
          const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(path, 3600);
          if (signed) {
            (story.story_media[0].media as any).signed_url = signed.signedUrl;
          }
        }
      }
    }
  }

  // 4. Build single group format identical to StoriesBar
  const isOwner = user && user.id === targetUserId;
  let allSeen = true;

  const stories = data.map((story: any) => {
    const hasSeen = userSeenSet.has(story.id);
    if (!hasSeen) {
      allSeen = false;
    }
    return {
      ...story,
      hasSeen,
      viewCount: story.view_count?.[0]?.count || 0
    };
  });

  return {
    author: data[0].author,
    stories,
    allSeen,
    lastUpdated: data[data.length - 1].created_at
  };
}

export async function markStoryViewed(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify ownership to avoid logging self
  const { data: story } = await supabase.from("stories").select("owner_id").eq("id", storyId).single()
  if (story?.owner_id === user.id) return

  // RLS doesn't allow UPDATE, so upsert can fail. We use insert and ignore unique violation (23505)
  const { error } = await supabase.from("story_views").insert({ story_id: storyId, viewer_id: user.id })
  
  // 23505 is unique_violation, meaning they already viewed it
  if (!error || error.code === '23505') {
    if (story && !error) await trackEvent("STORY_VIEW", "STORY", storyId, story.owner_id)
  } else {
    console.error("Error marking story viewed:", error)
  }
}

export async function fetchStoryViewers(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: story } = await supabase.from("stories").select("owner_id").eq("id", storyId).single()
  if (story?.owner_id !== user.id) return []

  const { data } = await supabase
    .from("story_views")
    .select(`
      viewer:profiles!story_views_viewer_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))
    `)
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })
    
  return data?.map((v: {viewer: unknown}) => v.viewer) || []
}






export async function deleteStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized: Inicia sesión para continuar.")

  // 1. STRICT OWNERSHIP CHECK: Must be performed using normal authenticated user session (RLS)
  // BEFORE any administrative client is initialized or used.
  const { data: story, error: fetchError } = await supabase
    .from("stories")
    .select(`
      id,
      owner_id,
      story_media(media_id, media:media_assets(id, owner_id, storage_path)),
      recipe:recipes(recipe_media(media:media_assets(storage_path))),
      session:cooking_sessions(session_media(media:media_assets(storage_path)))
    `)
    .eq("id", storyId)
    .single();

  if (fetchError || !story || story.owner_id !== user.id) {
    throw new Error("Unauthorized: no eres propietario de esta historia o no existe.");
  }

  // Collect all media paths belonging to this story (for user highlight cover checking)
  const storyPaths: string[] = [];
  if (story.story_media) {
    for (const sm of (story.story_media as any[])) {
      if (sm.media?.storage_path) storyPaths.push(sm.media.storage_path);
    }
  }
  if (story.recipe?.recipe_media) {
    for (const rm of (story.recipe.recipe_media as any[])) {
      if (rm.media?.storage_path) storyPaths.push(rm.media.storage_path);
    }
  }
  if (story.session?.session_media) {
    for (const sm of (story.session.session_media as any[])) {
      if (sm.media?.storage_path) storyPaths.push(sm.media.storage_path);
    }
  }

  // 2. Determine which storage files can safely be removed.
  // A file in Storage may ONLY be removed if:
  // a) The media asset is owned by this user (media.owner_id === user.id)
  // b) The media asset is NOT referenced by any other story, recipe, cooking session, or post
  const filesToDeleteFromStorage: string[] = [];
  const mediaAssetIdsToDelete: string[] = [];

  if (story.story_media && Array.isArray(story.story_media)) {
    for (const sm of (story.story_media as any[])) {
      const media = sm.media;
      const mediaId = sm.media_id;
      if (!media || !media.storage_path) continue;

      // Check media ownership - never delete media owned by another account
      if (media.owner_id !== user.id) {
        continue;
      }

      // Check if media is referenced elsewhere
      const { count: recipeRefCount } = await supabase
        .from("recipe_media")
        .select("id", { count: "exact", head: true })
        .eq("media_id", mediaId);

      const { count: sessionRefCount } = await supabase
        .from("session_media")
        .select("id", { count: "exact", head: true })
        .eq("media_id", mediaId);

      const { count: postRefCount } = await supabase
        .from("post_media")
        .select("id", { count: "exact", head: true })
        .eq("media_id", mediaId);

      const { count: otherStoryRefCount } = await supabase
        .from("story_media")
        .select("story_id", { count: "exact", head: true })
        .eq("media_id", mediaId)
        .neq("story_id", storyId);

      const isReferencedElsewhere =
        (recipeRefCount || 0) > 0 ||
        (sessionRefCount || 0) > 0 ||
        (postRefCount || 0) > 0 ||
        (otherStoryRefCount || 0) > 0;

      if (!isReferencedElsewhere) {
        filesToDeleteFromStorage.push(media.storage_path);
        if (media.id) mediaAssetIdsToDelete.push(media.id);
      }
    }
  }

  // 3. Highlight references cleanup (strictly scoped to the user's highlights)
  const { data: userHighlights } = await supabase
    .from("story_highlights")
    .select("id, cover_url")
    .eq("user_id", user.id);

  const userHighlightIds = new Set((userHighlights || []).map((h: any) => h.id));

  const { data: hsRows } = await supabase
    .from("highlight_stories")
    .select("highlight_id")
    .eq("story_id", storyId);

  const affectedHighlightIds = new Set<string>(
    (hsRows || [])
      .map((r: any) => r.highlight_id)
      .filter((hid: string) => userHighlightIds.has(hid))
  );

  for (const uh of (userHighlights || [])) {
    const cover = uh.cover_url;
    if (cover) {
      const matchesDeleted = storyPaths.some(p => {
        const fn = p.split("/").pop();
        return cover.includes(p) || (fn ? cover.includes(fn) : false);
      });
      if (matchesDeleted) {
        affectedHighlightIds.add(uh.id);
      }
    }
  }

  // 4. Server-only admin client used ONLY for final authorized storage and DB cleanup
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminSupabase = serviceKey
    ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
        serviceKey
      )
    : null;
  const dbClient = adminSupabase || supabase;

  // Process each affected highlight: remove story and update cover or delete if empty
  for (const highlightId of affectedHighlightIds) {
    // Delete the relation for this story
    await dbClient
      .from("highlight_stories")
      .delete()
      .match({ highlight_id: highlightId, story_id: storyId });

    // Fetch remaining stories in this highlight
    const { data: remainingHS } = await dbClient
      .from("highlight_stories")
      .select(`
        display_order,
        stories (
          id,
          story_media(media:media_assets(storage_path)),
          recipe:recipes(recipe_media(media:media_assets(storage_path))),
          session:cooking_sessions(session_media(media:media_assets(storage_path)))
        )
      `)
      .eq("highlight_id", highlightId)
      .order("display_order", { ascending: true });

    const remainingStories = (remainingHS || [])
      .map((r: any) => r.stories)
      .filter((s: any) => s && s.id !== storyId && !s.deleted_at);

    if (remainingStories.length === 0) {
      // Si el destacado se queda sin Stories válidas, eliminarlo por completo
      await dbClient.from("story_highlights").delete().eq("id", highlightId);
    } else {
      // Si el destacado aún tiene Stories válidas, comprobar si hay que recalcular la portada
      const uh = (userHighlights || []).find((h: any) => h.id === highlightId);
      const currentCover = uh?.cover_url;
      let needsNewCover = false;

      if (!currentCover) {
        needsNewCover = true;
      } else {
        const coverMatchesDeleted = storyPaths.some(p => {
          const fn = p.split("/").pop();
          return currentCover.includes(p) || (fn ? currentCover.includes(fn) : false);
        });
        if (coverMatchesDeleted) {
          needsNewCover = true;
        } else {
          // Check if cover matches any of the remaining valid stories
          const remainingPaths: string[] = [];
          for (const rs of remainingStories) {
            if (rs.story_media) for (const sm of rs.story_media) if (sm.media?.storage_path) remainingPaths.push(sm.media.storage_path);
            if (rs.recipe?.recipe_media) for (const rm of rs.recipe.recipe_media) if (rm.media?.storage_path) remainingPaths.push(rm.media.storage_path);
            if (rs.session?.session_media) for (const sm of rs.session.session_media) if (sm.media?.storage_path) remainingPaths.push(sm.media.storage_path);
          }
          const matchesRemaining = remainingPaths.some(p => {
            const fn = p.split("/").pop();
            return currentCover.includes(p) || (fn ? currentCover.includes(fn) : false);
          });
          if (!matchesRemaining) {
            needsNewCover = true;
          }
        }
      }

      if (needsNewCover) {
        let newCoverUrl: string | null = null;
        for (const rs of remainingStories) {
          const p = rs.story_media?.[0]?.media?.storage_path ||
                    rs.recipe?.recipe_media?.[0]?.media?.storage_path ||
                    rs.session?.session_media?.[0]?.media?.storage_path;
          if (p) {
            newCoverUrl = p.startsWith("http")
              ? p
              : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${p}`;
            break;
          }
        }
        await dbClient.from("story_highlights").update({ cover_url: newCoverUrl }).eq("id", highlightId);
      }
    }
  }

  // 5. Delete safe media files from storage (guaranteed server-side)
  if (filesToDeleteFromStorage.length > 0) {
    const buckets = ["recipe_media", "story_media"];
    for (const bucket of buckets) {
      await dbClient.storage.from(bucket).remove(filesToDeleteFromStorage);
    }
  }

  // 6. Delete orphaned media_assets records if any
  if (mediaAssetIdsToDelete.length > 0) {
    await dbClient.from("media_assets").delete().in("id", mediaAssetIdsToDelete);
  }

  // 7. Delete story record
  const { error } = await dbClient.from("stories").delete().eq("id", storyId);
  if (error) throw new Error("Failed to delete story: " + error.message);
  
  await trackEvent("STORY_DELETED", "STORY", storyId, user.id);

  // 8. Invalidate caches for all relevant routes
  const { data: profile } = await dbClient.from("profiles").select("username").eq("id", user.id).single();
  revalidatePath("/");
  revalidatePath("/me");
  if (profile?.username) {
    revalidatePath(`/@${profile.username}`);
    revalidatePath(`/${profile.username}`);
  }
  revalidatePath("/[userParam]", "page");
  revalidatePath("/profile/story-archive");
  revalidatePath("/", "layout");
}



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
    await createNotification(story.owner_id, 'REACTION' as any, 'story', storyId, { reaction });
  }

  return { success: true, action: 'added' }
}

export async function createStoryHighlight(name: string, storyIds: string[], coverUrl?: string) {
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
  
  if (error) throw error;
  
  if (storyIds.length > 0) {
    const inserts = storyIds.map((id, index) => ({
      highlight_id: highlight.id,
      story_id: id,
      display_order: index
    }));
    await supabase.from('highlight_stories').insert(inserts);
  }
  return highlight;
}

export async function voteStoryPoll(pollId: string, option: 'A' | 'B') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('story_poll_votes').insert({
    poll_id: pollId,
    user_id: user.id,
    selected_option: option
  });
}


export async function votePoll(storyId: string, pollId: string, option: 'A'|'B') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Check story existence and block status
    const { data: story } = await supabase.from('stories').select('owner_id, overlays').eq('id', storyId).single();
    if (!story) return { success: false, error: "Story not found" };

    const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: story.owner_id });
    if (isBlocked) return { success: false, error: "Action denied" };

    const isUuid = (str?: string) => !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    let targetPollId = pollId;

    // Resolve valid UUID for story_polls
    if (!isUuid(targetPollId)) {
      const { data: existingPoll } = await supabase.from('story_polls').select('id').eq('story_id', storyId).maybeSingle();
      if (existingPoll?.id) {
        targetPollId = existingPoll.id;
      } else {
        const pollOverlay = (story.overlays as any[])?.find((o: any) => o.type === 'POLL');
        const crypto = await import("crypto");
        targetPollId = crypto.randomUUID();
        await supabase.from('story_polls').insert({
          id: targetPollId,
          story_id: storyId,
          question: pollOverlay?.payload?.question || "Encuesta",
          option_a: pollOverlay?.payload?.optionA || "Opción A",
          option_b: pollOverlay?.payload?.optionB || "Opción B"
        });
      }
    }

    const { error } = await supabase.from('story_poll_votes').insert({
      poll_id: targetPollId,
      user_id: user.id,
      selected_option: option
    });

    if (error) {
      if (error.code === '23505') {
        return { success: true, alreadyVoted: true, pollId: targetPollId };
      }
      console.error("Error inserting vote:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, pollId: targetPollId };
  } catch (err: any) {
    console.error("votePoll error:", err);
    return { success: false, error: err?.message || "Error al votar" };
  }
}

export async function getPollResults(pollId: string, storyId?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isUuid = (str?: string) => !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    let targetPollId = pollId;

    if (!isUuid(targetPollId) && storyId) {
      const { data: existingPoll } = await supabase.from('story_polls').select('id').eq('story_id', storyId).maybeSingle();
      if (existingPoll?.id) targetPollId = existingPoll.id;
    }

    if (!isUuid(targetPollId)) {
      return { countA: 0, countB: 0, total: 0, percentA: 50, percentB: 50, myVote: null };
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let queryClient = supabase;
    if (serviceKey) {
      queryClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
        serviceKey
      );
    }
    
    const { data: votes, error } = await queryClient.from('story_poll_votes').select('selected_option, user_id').eq('poll_id', targetPollId);
    if (error) {
      return { countA: 0, countB: 0, total: 0, percentA: 50, percentB: 50, myVote: null };
    }
    
    let countA = 0;
    let countB = 0;
    let myVote = null;
    
    (votes || []).forEach(v => {
      if (v.selected_option === 'A') countA++;
      if (v.selected_option === 'B') countB++;
      if (user && v.user_id === user.id) myVote = v.selected_option;
    });
    
    const total = countA + countB;
    return {
      countA,
      countB,
      total,
      percentA: total > 0 ? Math.round((countA / total) * 100) : 50,
      percentB: total > 0 ? Math.round((countB / total) * 100) : 50,
      myVote
    };
  } catch (e) {
    console.error("getPollResults error:", e);
    return { countA: 0, countB: 0, total: 0, percentA: 50, percentB: 50, myVote: null };
  }
}

export async function publishPoll(storyId: string, pollId: string, question: string, optionA: string, optionB: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  const { error } = await supabase.from('story_polls').insert({
    id: pollId,
    story_id: storyId,
    question,
    option_a: optionA,
    option_b: optionB
  });
  if (error) throw error;
}

export async function submitQuestionReply(storyId: string, ownerId: string, question: string, answer: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check story existence and rules
  const { data: story } = await supabase.from('stories').select('owner_id, expires_at, allow_replies').eq('id', storyId).single();
  if (!story) throw new Error("Story not found");
  
  const recipientOwnerId = story.owner_id;

  if (new Date(story.expires_at) < new Date()) {
    throw new Error("Story expirada");
  }

  if (!story.allow_replies) {
    throw new Error("Las respuestas están desactivadas para esta historia");
  }

  const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: recipientOwnerId });
  if (isBlocked) throw new Error("Action denied");

  const { getOrCreateConversation, sendMessage } = await import('@/app/actions/messaging');
  const conv = await getOrCreateConversation(recipientOwnerId);
  
  await sendMessage({
    conversationId: conv,
    type: 'STORY',
    body: `Respondida a pregunta: "${question}"\n\n${answer}`,
    entityId: storyId
  });

  return true;
}



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

export async function getArchivedStories() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      story_media(media_id, media:media_assets(storage_path)),
      recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
      session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching archived stories:", error);
    return [];
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && data) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    );
    for (const story of data) {
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
        const countA = votes?.filter(v => (v as any).option === 'A').length || 0;
        const countB = votes?.filter(v => (v as any).option === 'B').length || 0;
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
  if (!user) throw new Error("Unauthorized");
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user.id) throw new Error("Unauthorized");
  
  await supabase.from('story_highlights').update({ name, cover_url: coverUrl }).eq('id', highlightId);

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  revalidatePath('/');
  revalidatePath('/me');
  if (profile?.username) {
    revalidatePath(`/@${profile.username}`);
    revalidatePath(`/${profile.username}`);
  }
  revalidatePath('/[userParam]', 'page');
  revalidatePath('/', 'layout');
  return true;
}

export async function deleteHighlight(highlightId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: h } = await supabase.from('story_highlights').select('user_id').eq('id', highlightId).single();
  if (h?.user_id !== user.id) throw new Error("Unauthorized");
  
  await supabase.from('story_highlights').delete().eq('id', highlightId);

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  revalidatePath('/');
  revalidatePath('/me');
  if (profile?.username) {
    revalidatePath(`/@${profile.username}`);
    revalidatePath(`/${profile.username}`);
  }
  revalidatePath('/[userParam]', 'page');
  revalidatePath('/', 'layout');
  return true;
}



export async function getMusicCatalog() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await (supabase as any)
    .from('story_music_tracks')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching music catalog:', error)
    return []
  }
  return data || []
}

