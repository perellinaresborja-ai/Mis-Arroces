// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { createNotification } from "@/app/actions/notifications"

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const content = formData.get("content") as string
  const visibility = formData.get("visibility") as string
  const recipeId = formData.get("recipeId") as string
  const mediaIdsRaw = formData.get("media_ids") as string
  const location = (formData.get("location") as string)?.trim() || null
  const collaboratorId = (formData.get("collaborator_id") as string)?.trim() || null
  const taggedUsersRaw = formData.get("tagged_users") as string

  if (!content || content.length > 2200) throw new Error("Invalid content")

  const postData: any = {
    author_id: user.id,
    content,
    visibility: (visibility as "PUBLIC" | "PRIVATE" | "FOLLOWERS") || "PUBLIC",
    recipe_id: recipeId || null
  }
  
  if (id) {
    postData.id = id
  }
  if (location) {
    postData.location = location
  }
  if (collaboratorId) {
    postData.collaborator_id = collaboratorId
  }

  let { error } = await supabase.from("social_posts").insert(postData)
  if (error && error.message?.includes("column")) {
    // Graceful fallback if database column hasn't finished migrating
    delete postData.location
    delete postData.collaborator_id
    const retry = await supabase.from("social_posts").insert(postData)
    error = retry.error
  }
  if (error) throw error

  // Save tags and parse mentions
  if (id) {
    try {
      const { parseAndSaveMentionsAndHashtags, saveTags } = await import("@/app/actions/social_features")
      await parseAndSaveMentionsAndHashtags(content, "social_post", id, user.id)

      if (taggedUsersRaw) {
        const taggedUsers = JSON.parse(taggedUsersRaw)
        if (Array.isArray(taggedUsers) && taggedUsers.length > 0) {
          await saveTags("social_post", id, user.id, taggedUsers)
        }
      }
    } catch (e) {
      console.error("Error processing tags/mentions for post:", e)
    }

    // Notify collaborator
    if (collaboratorId && collaboratorId !== user.id) {
      try {
        await createNotification(collaboratorId, 'TAG', 'post', id)
      } catch (e) {
        console.error("Error notifying collaborator:", e)
      }
    }
  }

  if (mediaIdsRaw && id) {
    try {
      const parsedMedia = JSON.parse(mediaIdsRaw) as (string | { id: string, is_primary?: boolean })[]
      if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
        const normalizedMedia = parsedMedia.map((m: any, idx: number) => {
          const mid = typeof m === 'string' ? m : m?.id
          const isPrimary = typeof m === 'object' && m?.is_primary !== undefined ? Boolean(m.is_primary) : idx === 0
          return { id: mid, isPrimary }
        }).filter(m => m.id)

        if (normalizedMedia.length > 0) {
          const primaryCount = normalizedMedia.filter(m => m.isPrimary).length
          if (primaryCount !== 1) {
            normalizedMedia.forEach((m, idx) => { m.isPrimary = idx === 0 })
          }

          const mediaInserts = normalizedMedia.map((m, index) => ({
            post_id: id,
            media_id: m.id,
            display_order: index,
            is_primary: m.isPrimary
          }))

          const { error: mediaError } = await (supabase.from("post_media" as any) as any).insert(mediaInserts)
          if (mediaError) {
            if (mediaError.message?.includes("is_primary") || mediaError.message?.includes("column")) {
              const fallbackInserts = mediaInserts.map(({ post_id, media_id, display_order }) => ({ post_id, media_id, display_order }))
              await (supabase.from("post_media" as any) as any).insert(fallbackInserts)
            } else {
              console.error("Error inserting post_media", mediaError)
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse media_ids", e)
    }
  }

  revalidatePath("/")
  revalidatePath("/discover")
  revalidatePath("/[userParam]", "page")

  try {
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    if (authorProfile?.username) {
      const cleanUser = authorProfile.username.replace(/^@+/, "")
      revalidatePath(`/@${cleanUser}`)
      revalidatePath(`/${cleanUser}`)
    }
  } catch (err) {
    console.error("Error revalidating profile paths:", err)
  }

  return { success: true, id }
}

export async function toggleSave(recipeId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (currentStatus) {
    await supabase.from("saves").delete().match({ user_id: user.id, recipe_id: recipeId })
  } else {
    await supabase.from("saves").insert({ user_id: user.id, recipe_id: recipeId })
  }
  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath("/cookbook")
}

export async function toggleWantToCook(recipeId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (currentStatus) {
    await supabase.from("want_to_cook").delete().match({ user_id: user.id, recipe_id: recipeId })
  } else {
    await supabase.from("want_to_cook").insert({ user_id: user.id, recipe_id: recipeId })
  }
  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath("/cookbook")
}

export async function toggleFollow(targetUserId: string, _clientIsPrivate?: boolean, currentStatus?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  if (user.id === targetUserId) throw new Error("No puedes seguirte a ti mismo")

  // Check if existing follow exists in database
  const { data: existingFollow } = await supabase
    .from("follows")
    .select("status")
    .match({ follower_id: user.id, following_id: targetUserId })
    .maybeSingle()

  if (existingFollow || currentStatus) {
    await supabase.from("follows").delete().match({ follower_id: user.id, following_id: targetUserId })
    revalidatePath("/discover")
    revalidatePath("/", "layout")
    return { status: null }
  } else {
    // SECURITY: Always check the target user's real privacy_level on the server
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("privacy_level")
      .eq("id", targetUserId)
      .maybeSingle()

    const isTargetPrivate = targetProfile?.privacy_level === "PRIVATE"
    const status = isTargetPrivate ? "PENDING" : "ACCEPTED"

    const { error: insertErr } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
      status
    })

    if (insertErr) {
      if (insertErr.code === '23505') {
        return { status }
      }
      throw new Error("Error al seguir al usuario: " + insertErr.message)
    }
    
    await createNotification(
      targetUserId, 
      status === "PENDING" ? 'FOLLOW_REQUEST' : 'FOLLOW', 
      'profile', 
      user.id
    )

    revalidatePath("/discover")
    revalidatePath("/", "layout")
    return { status }
  }
}

export async function acceptFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("follows")
    .update({ status: 'ACCEPTED' })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  await createNotification(followerId, 'FOLLOW_ACCEPT', 'profile', user.id)
  revalidatePath("/profile/requests")
}

export async function rejectFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("follows")
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  revalidatePath("/profile/requests")
}

export async function blockUser(blockedUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if already blocked
  const { data: existing } = await supabase.from('blocks').select('*').eq('blocker_id', user.id).eq('blocked_id', blockedUserId).single()
  
  if (!existing) {
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: blockedUserId })
    // Remove follows in both directions
    await supabase.from('follows').delete().or(`and(follower_id.eq.${user.id},following_id.eq.${blockedUserId}),and(follower_id.eq.${blockedUserId},following_id.eq.${user.id})`)
  }
}

export async function getFollowsList(targetUserId: string, type: 'followers' | 'following') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('follows').select(type === 'followers' 
    ? 'follower:profiles!follows_follower_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path))' 
    : 'following:profiles!follows_following_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path))'
  ).eq('status', 'ACCEPTED');

  if (type === 'followers') query = query.eq('following_id', targetUserId);
  else query = query.eq('follower_id', targetUserId);

  const { data } = await query;
  if (!data) return [];

  const profiles = data.map((d: any) => d.follower || d.following).filter(Boolean);

  if (!user) return profiles.map((p: any) => ({ ...p, followStatus: null }));

  const profileIds = profiles.map((p: any) => p.id);
  
  if (profileIds.length === 0) return [];

  const { data: myFollows } = await supabase.from('follows').select('following_id, status').eq('follower_id', user.id).in('following_id', profileIds);
  
  const followMap = myFollows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {};

  return profiles.map((p: any) => ({
    ...p,
    followStatus: followMap[p.id] || null
  }));
}
