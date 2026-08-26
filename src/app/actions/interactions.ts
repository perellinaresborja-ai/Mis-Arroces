"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { createNotification } from "@/app/actions/notifications"
import { parseAndSaveMentionsAndHashtags } from "./social_features"

type EntityType = "recipe" | "session" | "post" | "short"

export async function toggleCommentLike(entityType: EntityType, commentId: string, isLiked: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (isLiked) {
    if (entityType === "recipe") await supabase.from("recipe_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
  } else {
    if (entityType === "recipe") await supabase.from("recipe_comment_likes").insert({ comment_id: commentId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_comment_likes").insert({ comment_id: commentId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_comment_likes").insert({ comment_id: commentId, user_id: user.id })
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}

export async function toggleLike(entityType: EntityType, entityId: string, isLiked: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (isLiked) {
    if (entityType === "recipe") await supabase.from("recipe_likes").delete().match({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").delete().match({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").delete().match({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").delete().match({ short_id: entityId, user_id: user.id })
  } else {
    if (entityType === "recipe") await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id })
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}

export async function createComment(entityType: EntityType, entityId: string, content: string, parentId?: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const trimmedContent = content.trim()
  if (trimmedContent.length === 0 || trimmedContent.length > 1000) {
    throw new Error("Invalid comment length")
  }

  // Check allow_comments
  let commentsEnabled = true
  if (entityType === 'recipe') {
    const { data } = await supabase.from("recipes").select("allow_comments").eq("id", entityId).single()
    if (data?.allow_comments === false) commentsEnabled = false
  } else if (entityType === 'session') {
    const { data } = await supabase.from("cooking_sessions").select("allow_comments").eq("id", entityId).single()
    if (data?.allow_comments === false) commentsEnabled = false
  } else if (entityType === 'post') {
    const { data } = await supabase.from("social_posts").select("allow_comments").eq("id", entityId).single()
    if (data?.allow_comments === false) commentsEnabled = false
  }
  
  if (!commentsEnabled) throw new Error("Comments are disabled for this content")

  const insertData = { author_id: user.id, content: trimmedContent, parent_id: parentId || null }
  
  let insertedComment = null

  if (entityType === 'recipe') {
    const { data, error } = await supabase.from("recipe_comments").insert({ ...insertData, recipe_id: entityId }).select().single()
    if (error) throw new Error(error.message)
    insertedComment = data
  } else if (entityType === 'session') {
    const { data, error } = await supabase.from("session_comments").insert({ ...insertData, session_id: entityId }).select().single()
    if (error) throw new Error(error.message)
    insertedComment = data
  } else if (entityType === 'post') {
    const { data, error } = await supabase.from("post_comments").insert({ ...insertData, post_id: entityId }).select().single()
    if (error) throw new Error(error.message)
    insertedComment = data
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }

  if (insertedComment) {
      await parseAndSaveMentionsAndHashtags(trimmedContent, entityType === 'recipe' ? 'recipe_comment' : entityType === 'session' ? 'session_comment' : 'post_comment', insertedComment.id, user.id)
    }
    return insertedComment
}

export async function editComment(entityType: EntityType, commentId: string, newContent: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const trimmedContent = newContent.trim()
  if (trimmedContent.length === 0 || trimmedContent.length > 1000) {
    throw new Error("Invalid comment length")
  }

  const updatePayload = { content: trimmedContent, updated_at: new Date().toISOString() }
  
  if (entityType === 'recipe') {
    await supabase.from("recipe_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  } else if (entityType === 'session') {
    await supabase.from("session_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  } else if (entityType === 'post') {
    await supabase.from("post_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  } else if (entityType === 'short') {
    await supabase.from("short_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}

export async function deleteComment(entityType: EntityType, commentId: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const updatePayload = { is_deleted: true, content: "Comentario eliminado", updated_at: new Date().toISOString() }
  
  if (entityType === 'recipe') {
    await supabase.from("recipe_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  } else if (entityType === 'session') {
    await supabase.from("session_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  } else if (entityType === 'post') {
    await supabase.from("post_comments").update(updatePayload).match({ id: commentId, author_id: user.id })
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}


export async function toggleSave(recipeId: string, isSaved: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (isSaved) await supabase.from('saves').delete().match({ recipe_id: recipeId, user_id: user.id })
  else await supabase.from('saves').insert({ recipe_id: recipeId, user_id: user.id })
  if (pathToRevalidate) revalidatePath(pathToRevalidate)
}

export async function toggleWantToCook(recipeId: string, isWantToCook: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (isWantToCook) await supabase.from('want_to_cook').delete().match({ recipe_id: recipeId, user_id: user.id })
  else await supabase.from('want_to_cook').insert({ recipe_id: recipeId, user_id: user.id })
  if (pathToRevalidate) revalidatePath(pathToRevalidate)
}

export async function getComments(entityType: EntityType, entityId: string, currentUserId: string | null) {
  const supabase = await createClient()
  let query = null

  if (entityType === 'recipe') {
    query = supabase.from("recipe_comments").select(`
      *,
      author:profiles!recipe_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      likes:recipe_comment_likes(user_id)
    `).eq("recipe_id", entityId).order("created_at", { ascending: true })
  } else if (entityType === 'session') {
    query = supabase.from("session_comments").select(`
      *,
      author:profiles!session_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      likes:session_comment_likes(user_id)
    `).eq("session_id", entityId).order("created_at", { ascending: true })
  } else if (entityType === 'post') {
    query = supabase.from("post_comments").select(`
      *,
      author:profiles!post_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      likes:post_comment_likes(user_id)
    `).eq("post_id", entityId).order("created_at", { ascending: true })
  } else if (entityType === 'short') {
    query = supabase.from("short_comments").select(`
      *,
      author:profiles!short_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      likes:short_comment_likes(user_id)
    `).eq("short_id", entityId).order("created_at", { ascending: true })
  }

  if (!query) return []

  const { data, error } = await query
  if (error || !data) return []

  return data.map((c: any) => ({
    id: c.id,
    content: c.content,
    is_deleted: c.is_deleted,
    created_at: c.created_at,
    parent_id: c.parent_id,
    author: c.author,
    like_count: c.likes ? c.likes.length : 0,
    user_liked: currentUserId ? c.likes?.some((l: any) => l.user_id === currentUserId) : false
  }))
}

