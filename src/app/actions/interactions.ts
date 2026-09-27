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

export interface CommentMediaInput {
  type: "IMAGE" | "GIF"
  url: string
  metadata?: {
    width?: number
    height?: number
    aspectRatio?: number
    giphyId?: string
    size?: number
    original_name?: string
    storage_path?: string
  } | null
}

export async function createComment(
  entityType: EntityType, 
  entityId: string, 
  content: string, 
  parentId?: string,
  media?: CommentMediaInput | null,
  pathToRevalidate?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const trimmedContent = (content || "").trim()

  if (!trimmedContent && !media) {
    throw new Error("El comentario no puede estar vacío.")
  }
  if (trimmedContent.length > 1000) {
    throw new Error("El comentario supera el límite de 1000 caracteres.")
  }
  if (media) {
    if (!["IMAGE", "GIF"].includes(media.type)) {
      throw new Error("Tipo de archivo multimedia no válido.")
    }
    if (!media.url || typeof media.url !== "string") {
      throw new Error("URL de multimedia no válida.")
    }

    if (media.type === "IMAGE") {
      const isOurStorage = media.url.includes(`/recipe_media/${user.id}/comments/`) || media.url.startsWith(`${user.id}/comments/`)
      if (!isOurStorage) {
        throw new Error("La imagen adjunta no pertenece al almacenamiento autorizado del usuario.")
      }
      if (media.metadata?.size && typeof media.metadata.size === "number" && media.metadata.size > 15 * 1024 * 1024) {
        throw new Error("La imagen supera el límite de 15MB.")
      }
    } else if (media.type === "GIF") {
      try {
        const parsed = new URL(media.url)
        const hostname = parsed.hostname.toLowerCase()
        if (!hostname.endsWith("giphy.com")) {
          throw new Error()
        }
      } catch {
        throw new Error("URL de GIF no válida. Solo se admiten recursos procedentes de GIPHY.")
      }
    }
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
  } else if (entityType === 'short') {
    // shorts have comments enabled by default
  }
  
  if (!commentsEnabled) throw new Error("Comments are disabled for this content")

  const insertData = { 
    author_id: user.id, 
    content: trimmedContent, 
    parent_id: parentId || null,
    media_type: media ? media.type : null,
    media_url: media ? media.url : null,
    media_metadata: media?.metadata || null
  }
  
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
  } else if (entityType === 'short') {
    const { data, error } = await supabase.from("short_comments").insert({ ...insertData, short_id: entityId }).select().single()
    if (error) throw new Error(error.message)
    insertedComment = data
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }

  if (insertedComment && trimmedContent.length > 0) {
    try {
      await parseAndSaveMentionsAndHashtags(
        trimmedContent, 
        entityType === 'recipe' ? 'recipe_comment' : entityType === 'session' ? 'session_comment' : entityType === 'short' ? 'short_comment' : 'post_comment', 
        insertedComment.id, 
        user.id
      )
    } catch (tagErr) {
      console.warn("Could not parse or save mentions/hashtags for comment:", tagErr)
    }
  }
  if (insertedComment) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .eq("id", user.id)
      .maybeSingle()
    if (profile) {
      (insertedComment as any).author = profile
    }
  }

  return insertedComment
}

export async function editComment(
  entityType: EntityType, 
  commentId: string, 
  newContent: string, 
  removeMedia?: boolean,
  pathToRevalidate?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const trimmedContent = (newContent || "").trim()

  let table = ""
  if (entityType === 'recipe') table = "recipe_comments"
  else if (entityType === 'session') table = "session_comments"
  else if (entityType === 'post') table = "post_comments"
  else if (entityType === 'short') table = "short_comments"
  if (!table) return

  const { data: current }: any = await supabase
    .from(table as any)
    .select("id, author_id, media_type, media_url")
    .eq("id", commentId)
    .single()

  if (!current || current.author_id !== user.id) {
    throw new Error("No tienes permiso para editar este comentario")
  }

  if (!trimmedContent && (!current.media_url || removeMedia)) {
    throw new Error("El comentario no puede quedar completamente vacío")
  }
  if (trimmedContent.length > 1000) {
    throw new Error("El comentario supera el límite de 1000 caracteres")
  }

  const updatePayload: any = { 
    content: trimmedContent, 
    updated_at: new Date().toISOString() 
  }

  if (removeMedia) {
    if (current.media_type === "IMAGE" && current.media_url) {
      const storagePath = current.media_url.replace(/^.*\/recipe_media\//, "")
      try {
        await supabase.storage.from("recipe_media").remove([storagePath])
      } catch (storageErr) {
        console.warn("Error removing comment media from storage:", storageErr)
      }
    }
    updatePayload.media_type = null
    updatePayload.media_url = null
    updatePayload.media_metadata = null
  }

  await supabase.from(table as any).update(updatePayload).match({ id: commentId, author_id: user.id })

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}

export async function deleteComment(entityType: EntityType, commentId: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let table = ""
  if (entityType === 'recipe') table = "recipe_comments"
  else if (entityType === 'session') table = "session_comments"
  else if (entityType === 'post') table = "post_comments"
  else if (entityType === 'short') table = "short_comments"
  if (!table) return

  // Limpieza de foto propia en Storage
  const { data: current }: any = await supabase
    .from(table as any)
    .select("id, author_id, media_type, media_url")
    .eq("id", commentId)
    .single()

  if (current && current.media_type === "IMAGE" && current.media_url) {
    const storagePath = current.media_url.replace(/^.*\/recipe_media\//, "")
    try {
      await supabase.storage.from("recipe_media").remove([storagePath])
    } catch (storageErr) {
      console.warn("Error removing deleted comment media from storage:", storageErr)
    }
  }

  const updatePayload = { 
    is_deleted: true, 
    content: "Comentario eliminado", 
    media_type: null,
    media_url: null,
    media_metadata: null,
    updated_at: new Date().toISOString() 
  }
  
  await supabase.from(table as any).update(updatePayload).match({ id: commentId, author_id: user.id })

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
  offset: number = 0,
  sortBy: "recent" | "highlighted" = "recent"
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
  const isDescending = sortBy === "recent"
  const { data: rootComments, error: rootError } = await (supabase.from(table as any) as any)
    .select(selectQuery)
    .eq(foreignKey, entityId)
    .is("parent_id", null)
    .order("created_at", { ascending: !isDescending })
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
    if (c.author_id === currentUserId) return true
    
    if (hiddenWords.length > 0 && c.content) {
      const contentLower = c.content.toLowerCase()
      for (const word of hiddenWords) {
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

export interface EntityLikeUser {
  id: string
  username: string
  display_name: string
  privacy_level: string
  avatar: { storage_path?: string } | null
  emoji: string
  created_at: string
  followStatus: "ACCEPTED" | "PENDING" | null
}

export interface GetEntityLikesResult {
  users: EntityLikeUser[]
  totalCount: number
  hasMore: boolean
}

export async function getEntityLikes(
  entityType: EntityType,
  entityId: string,
  limit: number = 30,
  offset: number = 0
): Promise<GetEntityLikesResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let table = ""
  let foreignKey = ""

  if (entityType === "recipe") {
    table = "recipe_likes"
    foreignKey = "recipe_id"
  } else if (entityType === "session") {
    table = "session_likes"
    foreignKey = "session_id"
  } else if (entityType === "post") {
    table = "post_likes"
    foreignKey = "post_id"
  } else if (entityType === "short") {
    table = "short_likes"
    foreignKey = "short_id"
  }

  if (!table) return { users: [], totalCount: 0, hasMore: false }

  // 1 & 2. Concurrently fetch paginated likes with user profiles (including exact count) AND user blocks
  const selectQuery = `
    emoji,
    created_at,
    user:profiles!${table}_user_id_fkey(
      id,
      username,
      display_name,
      privacy_level,
      avatar:media_assets!fk_profiles_avatar(storage_path)
    )
  `

  const [likesRes, blocksRes] = await Promise.all([
    (supabase.from(table as any) as any)
      .select(selectQuery, { count: "exact" })
      .eq(foreignKey, entityId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    user
      ? supabase
          .from("blocks")
          .select("blocker_id, blocked_id")
          .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`)
      : Promise.resolve({ data: [] })
  ])

  const likesData = likesRes.data
  const count = likesRes.count
  const likesError = likesRes.error

  if (likesError || !likesData) {
    return { users: [], totalCount: count || 0, hasMore: false }
  }

  // 3. Blocked users filtering (bidirectional)
  const blockedUserIds = new Set<string>()
  if (user && blocksRes.data) {
    blocksRes.data.forEach((b: any) => {
      if (b.blocker_id === user.id) blockedUserIds.add(b.blocked_id)
      if (b.blocked_id === user.id) blockedUserIds.add(b.blocker_id)
    })
  }

  // 4. Map profiles
  const rawUsers: EntityLikeUser[] = (likesData as any[])
    .filter(row => row.user && !blockedUserIds.has(row.user.id))
    .map(row => ({
      id: row.user.id,
      username: row.user.username,
      display_name: row.user.display_name || row.user.username,
      privacy_level: row.user.privacy_level || "PUBLIC",
      avatar: row.user.avatar || null,
      emoji: row.emoji || "🥘",
      created_at: row.created_at,
      followStatus: null
    }))

  // 5. Follow status check (single IN query to avoid N+1)
  if (user && rawUsers.length > 0) {
    const targetIds = rawUsers.map(u => u.id).filter(id => id !== user.id)
    if (targetIds.length > 0) {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id, status")
        .eq("follower_id", user.id)
        .in("following_id", targetIds)

      const followMap = (myFollows || []).reduce((acc: any, f: any) => {
        acc[f.following_id] = f.status
        return acc
      }, {})

      rawUsers.forEach(u => {
        if (u.id !== user.id) {
          u.followStatus = followMap[u.id] || null
        }
      })
    }
  }

  const effectiveTotal = count !== null && count !== undefined ? count : rawUsers.length
  const hasMore = offset + rawUsers.length < effectiveTotal

  return {
    users: rawUsers,
    totalCount: effectiveTotal,
    hasMore
  }
}







