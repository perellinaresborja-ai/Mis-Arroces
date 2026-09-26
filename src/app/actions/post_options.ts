"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function toggleComments(entityType: string, entityId: string, currentState: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let table = 'social_posts'
  let authorField = 'author_id'
  
  if (entityType === 'recipe') {
    table = 'recipes'
    authorField = 'owner_id'
  } else if (entityType === 'session') {
    table = 'cooking_sessions'
    authorField = 'user_id'
  }

  const { error } = await supabase.from(table as any)
    .update({ allow_comments: !currentState })
    .eq('id', entityId)
    .eq(authorField, user.id)

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/[userParam]')
}

export async function deleteEntity(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (entityType === 'recipe') {
    // 1. Delete saves and want_to_cook
    await supabase.from('saves').delete().eq('recipe_id', entityId);
    await supabase.from('want_to_cook').delete().eq('recipe_id', entityId);

    // 2. Soft delete the recipe
    const { error } = await supabase
      .from('recipes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entityId)
      .eq('owner_id', user.id);
    if (error) throw error;
  } else {
    let table = 'social_posts'
    let authorField = 'author_id'
    
    if (entityType === 'session') {
      table = 'cooking_sessions'
      authorField = 'user_id'
    }

    const { error } = await supabase.from(table as any)
      .delete()
      .eq('id', entityId)
      .eq(authorField, user.id)

    if (error) throw error
  }
}

export async function toggleBookmark(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // For recipes, use the existing saves table
  if (entityType === 'recipe') {
    const { data: existing } = await supabase
      .from('saves')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_id', entityId)
      .single()

    if (existing && (existing as any).id) {
      await supabase.from('saves').delete().match({ user_id: user.id, recipe_id: entityId })
    } else {
      await supabase.from('saves').insert({ user_id: user.id, recipe_id: entityId })
    }
  } else {
    // For posts and sessions, use the new bookmarks table
    const { data: existing } = await supabase
      .from('bookmarks' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single()

    if (existing) {
      await supabase.from('bookmarks' as any).delete().eq('id', (existing as any).id)
    } else {
      await supabase.from('bookmarks' as any).insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId
      })
    }
  }

  revalidatePath('/')
  revalidatePath('/[userParam]')
}

export interface UpdatePostParams {
  postId: string
  content: string
  location?: string | null
  collaboratorId?: string | null
  recipeId?: string | null
  tags?: any[]
  mediaItems?: { id: string, is_primary?: boolean }[]
}

export async function updatePost({
  postId,
  content,
  location,
  collaboratorId,
  recipeId,
  tags = [],
  mediaItems
}: UpdatePostParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (!content || content.length > 2200) {
    throw new Error("El contenido no puede estar vacío ni superar los 2200 caracteres.")
  }

  // 1. Verify ownership
  const { data: existingPost, error: fetchErr } = await supabase
    .from('social_posts' as any)
    .select('id, author_id, collaborator_id')
    .eq('id', postId)
    .eq('author_id', user.id)
    .single()

  if (fetchErr || !existingPost) {
    throw new Error("No tienes permiso para editar esta publicación.")
  }

  // 2. Update post fields without touching post_media!
  const updates: any = {
    content,
    recipe_id: recipeId || null,
    updated_at: new Date().toISOString()
  }
  if (typeof location !== 'undefined') {
    updates.location = location || null
  }
  if (typeof collaboratorId !== 'undefined') {
    updates.collaborator_id = collaboratorId || null
  }

  let { error: updateErr } = await supabase
    .from('social_posts' as any)
    .update(updates)
    .eq('id', postId)
    .eq('author_id', user.id)

  if (updateErr && updateErr.message?.includes("column")) {
    delete updates.location
    delete updates.collaborator_id
    const retry = await supabase
      .from('social_posts' as any)
      .update(updates)
      .eq('id', postId)
      .eq('author_id', user.id)
    updateErr = retry.error
  }
  if (updateErr) throw updateErr

  // 2b. Update post_media if mediaItems was provided
  if (mediaItems && Array.isArray(mediaItems)) {
    await supabase.from("post_media").delete().eq("post_id", postId)
    if (mediaItems.length > 0) {
      const normalized = mediaItems.map((m: any, idx: number) => ({
        id: typeof m === 'string' ? m : m?.id,
        isPrimary: typeof m === 'object' && m?.is_primary !== undefined ? Boolean(m.is_primary) : idx === 0
      })).filter(m => m.id)

      if (normalized.length > 0) {
        const primaryCount = normalized.filter(m => m.isPrimary).length
        if (primaryCount !== 1) {
          normalized.forEach((m, idx) => { m.isPrimary = idx === 0 })
        }

        const inserts = normalized.map((m, idx) => ({
          post_id: postId,
          media_id: m.id,
          display_order: idx,
          is_primary: m.isPrimary
        }))

        const { error: insertErr } = await (supabase.from("post_media" as any) as any).insert(inserts)
        if (insertErr) {
          if (insertErr.message?.includes("is_primary") || insertErr.message?.includes("column")) {
            const fallback = inserts.map(({ post_id, media_id, display_order }) => ({ post_id, media_id, display_order }))
            await (supabase.from("post_media" as any) as any).insert(fallback)
          } else {
            console.error("Error updating post_media", insertErr)
          }
        }
      }
    }
  }

  // 3. Update tags and mentions
  try {
    const { parseAndSaveMentionsAndHashtags, saveTags } = await import("@/app/actions/social_features")
    await parseAndSaveMentionsAndHashtags(content, "social_post", postId, user.id)
    await saveTags("social_post", postId, user.id, tags)
  } catch (e) {
    console.error("Error updating tags/mentions:", e)
  }

  // 4. Notify new collaborator if changed
  if (collaboratorId && collaboratorId !== user.id && collaboratorId !== (existingPost as any).collaborator_id) {
    try {
      const { createNotification } = await import("@/app/actions/notifications")
      await createNotification(collaboratorId, 'TAG', 'post', postId)
    } catch (e) {
      console.error("Error notifying collaborator:", e)
    }
  }

  revalidatePath('/')
  revalidatePath('/feed')
  revalidatePath('/discover')
  revalidatePath('/[userParam]', 'layout')
  revalidatePath(`/posts/${postId}`)

  return { success: true }
}

export async function updatePostContent(entityId: string, content: string) {
  return updatePost({ postId: entityId, content })
}

export async function updateSessionContent(entityId: string, notes: string, rating: number, socarrat: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('cooking_sessions' as any)
    .update({ notes, rating, socarrat_level: socarrat })
    .eq('id', entityId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/[userParam]', 'layout')
}


export async function togglePin(entityType: string, entityId: string, currentState: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let table = 'social_posts'
  let authorField = 'author_id'
  
  if (entityType === 'recipe') {
    table = 'recipes'
    authorField = 'owner_id'
  } else if (entityType === 'session') {
    table = 'cooking_sessions'
    authorField = 'user_id'
  }

  // If trying to pin, check if already pinned 3 items across all tables
  if (!currentState) {
    const { data: pinnedRecipes } = await supabase.from('recipes').select('id').eq('owner_id', user.id).eq('is_pinned', true)
    const { data: pinnedSessions } = await supabase.from('cooking_sessions').select('id').eq('user_id', user.id).eq('is_pinned', true)
    const { data: pinnedPosts } = await supabase.from('social_posts').select('id').eq('author_id', user.id).eq('is_pinned', true)
    
    const totalPinned = (pinnedRecipes?.length || 0) + (pinnedSessions?.length || 0) + (pinnedPosts?.length || 0)
    
    if (totalPinned >= 3) {
      throw new Error("No puedes fijar más de 3 publicaciones. Desfija alguna primero.")
    }
  }

  const { error } = await supabase.from(table as any)
    .update({ is_pinned: !currentState })
    .eq('id', entityId)
    .eq(authorField, user.id)

  if (error) throw error

  revalidatePath('/[userParam]', 'layout')
}
