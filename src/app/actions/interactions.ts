"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { createNotification } from "@/app/actions/notifications"
import { parseAndSaveMentionsAndHashtags } from "./social_features"

type EntityType = "recipe" | "session" | "post" | "short"

export async function toggleCommentReaction(entityType: EntityType, commentId: string, emoji: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (entityType === "recipe") {
    const { data: existing } = await supabase.from("recipe_comment_likes").select("emoji").match({ comment_id: commentId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("recipe_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
      else await supabase.from("recipe_comment_likes").update({ emoji }).match({ comment_id: commentId, user_id: user.id })
    } else {
      await supabase.from("recipe_comment_likes").insert({ comment_id: commentId, user_id: user.id, emoji })
    }
  } else if (entityType === "session") {
    const { data: existing } = await supabase.from("session_comment_likes").select("emoji").match({ comment_id: commentId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("session_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
      else await supabase.from("session_comment_likes").update({ emoji }).match({ comment_id: commentId, user_id: user.id })
    } else {
      await supabase.from("session_comment_likes").insert({ comment_id: commentId, user_id: user.id, emoji })
    }
  } else if (entityType === "post") {
    const { data: existing } = await supabase.from("post_comment_likes").select("emoji").match({ comment_id: commentId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("post_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
      else await supabase.from("post_comment_likes").update({ emoji }).match({ comment_id: commentId, user_id: user.id })
    } else {
      await supabase.from("post_comment_likes").insert({ comment_id: commentId, user_id: user.id, emoji })
    }
  } else if (entityType === "short") {
    const { data: existing } = await supabase.from("short_comment_likes").select("emoji").match({ comment_id: commentId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("short_comment_likes").delete().match({ comment_id: commentId, user_id: user.id })
      else await supabase.from("short_comment_likes").update({ emoji }).match({ comment_id: commentId, user_id: user.id })
    } else {
      await supabase.from("short_comment_likes").insert({ comment_id: commentId, user_id: user.id, emoji })
    }
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}

export async function toggleLike(entityType: EntityType, entityId: string, emoji: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (entityType === "recipe") {
    const { data: existing } = await supabase.from("recipe_likes").select("emoji").match({ recipe_id: entityId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("recipe_likes").delete().match({ recipe_id: entityId, user_id: user.id })
      else await supabase.from("recipe_likes").update({ emoji }).match({ recipe_id: entityId, user_id: user.id })
    } else {
      await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id, emoji })
    }
  } else if (entityType === "session") {
    const { data: existing } = await supabase.from("session_likes").select("emoji").match({ session_id: entityId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("session_likes").delete().match({ session_id: entityId, user_id: user.id })
      else await supabase.from("session_likes").update({ emoji }).match({ session_id: entityId, user_id: user.id })
    } else {
      await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id, emoji })
    }
  } else if (entityType === "post") {
    const { data: existing } = await supabase.from("post_likes").select("emoji").match({ post_id: entityId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("post_likes").delete().match({ post_id: entityId, user_id: user.id })
      else await supabase.from("post_likes").update({ emoji }).match({ post_id: entityId, user_id: user.id })
    } else {
      await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id, emoji })
    }
  } else if (entityType === "short") {
    const { data: existing } = await supabase.from("short_likes").select("emoji").match({ short_id: entityId, user_id: user.id }).maybeSingle()
    if (existing) {
      if (existing.emoji === emoji) await supabase.from("short_likes").delete().match({ short_id: entityId, user_id: user.id })
      else await supabase.from("short_likes").update({ emoji }).match({ short_id: entityId, user_id: user.id })
    } else {
      await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id, emoji })
    }
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

export async function getComments(
  entityType: EntityType, 
  entityId: string, 
  currentUserId: string | null,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = await createClient()
  let table = ""
  let foreignKey = ""
  let likesRelation = ""
  let ownerId: string | null = null

  if (entityType === 'recipe') {
    table = "recipe_comments"
    foreignKey = "recipe_id"
    likesRelation = "recipe_comment_likes"
    const { data: ent } = await supabase.from('recipes').select('owner_id').eq('id', entityId).single()
    ownerId = ent?.owner_id || null
  } else if (entityType === 'session') {
    table = "session_comments"
    foreignKey = "session_id"
    likesRelation = "session_comment_likes"
    const { data: ent } = await supabase.from('cooking_sessions').select('user_id').eq('id', entityId).single()
    ownerId = ent?.user_id || null
  } else if (entityType === 'post') {
    table = "post_comments"
    foreignKey = "post_id"
    likesRelation = "post_comment_likes"
    const { data: ent } = await supabase.from('social_posts').select('author_id').eq('id', entityId).single()
    ownerId = ent?.author_id || null
  } else if (entityType === 'short') {
    table = "short_comments"
    foreignKey = "short_id"
    likesRelation = "short_comment_likes"
    const { data: ent } = await supabase.from('shorts').select('owner_id').eq('id', entityId).single()
    ownerId = ent?.owner_id || null
  }

  if (!table) return []

  const selectQuery = `
    *,
    author:profiles!${table}_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
    reactions:${likesRelation}(user_id, emoji)
  `

  // 1. Fetch paginated top-level (root) comments
  const { data: rootComments, error: rootError } = await (supabase.from(table as any) as any)
    .select(selectQuery)
    .eq(foreignKey, entityId)
    .is("parent_id", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1)

  if (rootError || !rootComments) return []

  // 2. Fetch all replies corresponding to these loaded root comments
  const rootIds = (rootComments as any[]).map(c => c.id)
  let replies: any[] = []
  if (rootIds.length > 0) {
    const { data: repliesData } = await (supabase.from(table as any) as any)
      .select(selectQuery)
      .in("parent_id", rootIds)
      .order("created_at", { ascending: true })
    if (repliesData) {
      replies = repliesData
    }
  }

  const data = [...rootComments, ...replies]

  // Fetch hidden words for the owner
  let hiddenWords: string[] = []
  if (ownerId) {
    const { data: hw } = await supabase.from('hidden_words').select('word').eq('user_id', ownerId)
    if (hw) {
      hiddenWords = hw.map(h => h.word.toLowerCase())
    }
  }

  // Filter out comments that contain hidden words, unless the current user is the author of the comment
  const filteredData = data.filter((c: any) => {
    if (c.author_id === currentUserId) return true // You can always see your own comments
    
    if (hiddenWords.length > 0 && c.content) {
      const contentLower = c.content.toLowerCase()
      for (const word of hiddenWords) {
        // Simple word boundary regex to avoid partial matches
        const regex = new RegExp(`\\b${word}\\b`, 'i')
        if (regex.test(contentLower)) {
          return false
        }
      }
    }
    return true
  })

  return filteredData.map((c: any) => ({
    ...c,
    reactions: c.reactions || []
  }))
}






