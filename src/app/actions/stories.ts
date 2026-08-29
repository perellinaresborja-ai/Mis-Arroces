// @ts-nocheck
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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: story, error } = await supabase.from("stories").insert({
    owner_id: user.id,
    caption: data.caption || null,
    recipe_id: data.recipeId || null,
    session_id: data.sessionId || null,
    visibility: "PUBLIC",
    media_transform: data.mediaTransform || null,
    overlays: data.overlays || [],
    background: data.background || null
  }).select().single()

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


export async function fetchActiveStories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get all active stories
  const { data, error } = await supabase
    .from("stories")
    .select(`
      *,
      author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      story_media(media:media_assets(storage_path)),
      story_views(viewer_id),
        recipe:recipes(id, name, recipe_media(media:media_assets(storage_path))),
        session:cooking_sessions(id, session_media(media:media_assets(storage_path)))
    `)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })

  if (!data) return []

    // Generate signed URLs for story media using SERVICE_ROLE
  // This is completely isolated from the browser and only signs paths that were already authorized by the RLS of 'stories'
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
          // Admin client bypasses RLS on Storage to generate the signature
          const { data: signed } = await adminSupabase.storage.from('recipe_media').createSignedUrl(path, 3600);
          if (signed) {
            story.story_media[0].media.signed_url = signed.signedUrl;
          }
        }
      }
    }
  }

  // Group by owner
  const userMap = new Map()
  data.forEach((story: any) => {
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
    const hasSeen = user ? story.story_views?.some((v: any) => v.viewer_id === user.id) : false;
    
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
      viewCount: story.story_views?.length || 0
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

export async function markStoryViewed(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify ownership to avoid logging self
  const { data: story } = await supabase.from("stories").select("owner_id").eq("id", storyId).single()
  if (story?.owner_id === user.id) return

  // INSERT ON CONFLICT DO NOTHING relies on unique constraint (story_id, viewer_id)
  await supabase.from("story_views").upsert({ story_id: storyId, viewer_id: user.id }, { onConflict: "story_id, viewer_id", ignoreDuplicates: true })
    await trackEvent("STORY_VIEW", "STORY", storyId, story.owner_id)
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
    
  return data?.map((v: any) => v.viewer) || []
}






export async function deleteStory(storyId: string) {
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
    await createNotification(story.owner_id, 'REACTION', 'story', storyId, { reaction });
  }

  return { success: true, action: 'added' }
}

export async function createStoryHighlight(name: string, storyIds: string[], coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: highlight, error } = await supabase.from('story_highlights').insert({
    user_id: user.id,
    name,
    cover_url: coverUrl
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check blocks
  const { data: story } = await supabase.from('stories').select('owner_id, expires_at').eq('id', storyId).single();
  if (!story) throw new Error("Story not found");
  
  if (new Date(story.expires_at) < new Date()) {
    throw new Error("Story expired");
  }

  const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: story.owner_id });
  if (isBlocked) throw new Error("Action denied");

  const { error } = await supabase.from('story_poll_votes').insert({
    poll_id: pollId,
    user_id: user.id,
    selected_option: option
  });

  if (error) {
    if (error.code === '23505') throw new Error("Ya has votado en esta encuesta");
    throw error;
  }
  
  return true;
}

export async function getPollResults(pollId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: votes, error } = await supabase.from('story_poll_votes').select('selected_option, user_id').eq('poll_id', pollId);
  if (error) throw error;
  
  let countA = 0;
  let countB = 0;
  let myVote = null;
  
  votes.forEach(v => {
    if (v.selected_option === 'A') countA++;
    if (v.selected_option === 'B') countB++;
    if (user && v.user_id === user.id) myVote = v.selected_option;
  });
  
  const total = countA + countB;
  return {
    countA,
    countB,
    total,
    percentA: total > 0 ? Math.round((countA / total) * 100) : 0,
    percentB: total > 0 ? Math.round((countB / total) * 100) : 0,
    myVote
  };
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
  
  // Create conversation or use existing
  let { data: convs } = await supabase.rpc('get_conversation_with_user', { other_user_id: ownerId })
  let conversationId = convs?.[0]?.id

  if (!conversationId) {
    const { data: newConv } = await supabase.from('conversations').insert({}).select().single()
    if (newConv) {
      conversationId = newConv.id
      await supabase.from('conversation_members').insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: ownerId }
      ])
    }
  }

  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: `Respuesta a tu pregunta "${question}": ${answer}`,
      message_type: 'STORY_REPLY',
      metadata: { story_id: storyId }
    })
  }
}
