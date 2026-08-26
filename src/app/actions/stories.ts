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

    if (data.mediaId) {
    await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    })
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
          const { data: signed } = await adminSupabase.storage.from('story_media').createSignedUrl(path, 3600);
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

