// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { createNotification } from "@/app/actions/notifications"
import { redirect } from "next/navigation"

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const content = formData.get("content") as string
  const visibility = formData.get("visibility") as string
  const recipeId = formData.get("recipeId") as string
  const mediaIdsRaw = formData.get("media_ids") as string

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

  const { error } = await supabase.from("social_posts").insert(postData)
  if (error) throw error

  if (mediaIdsRaw && id) {
    try {
      const mediaIds = JSON.parse(mediaIdsRaw) as string[]
      if (Array.isArray(mediaIds) && mediaIds.length > 0) {
        const mediaInserts = mediaIds.map((media_id, index) => ({
          post_id: id,
          media_id,
          display_order: index
        }))
        const { error: mediaError } = await supabase.from("post_media").insert(mediaInserts)
        if (mediaError) console.error("Error inserting post_media", mediaError)
      }
    } catch (e) {
      console.error("Failed to parse media_ids", e)
    }
  }

  revalidatePath("/")
  revalidatePath("/discover")
  redirect("/")
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

export async function toggleFollow(targetUserId: string, isPrivate: boolean, currentStatus: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (currentStatus) {
    await supabase.from("follows").delete().match({ follower_id: user.id, following_id: targetUserId })
  } else {
    const status = isPrivate ? "PENDING" : "ACCEPTED"
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
      status
    })
    
    await createNotification(
      targetUserId, 
      status === "PENDING" ? 'FOLLOW_REQUEST' : 'FOLLOW', 
      'profile', 
      user.id
    )
  }
  revalidatePath("/discover")
  revalidatePath("/", "layout")
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
