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
    .delete()
    .eq('id', entityId)
    .eq(authorField, user.id)

  if (error) throw error

  // The cascade should handle comments, likes, media, etc.
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
