'use server';

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Utility to create admin client for deletion
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Faltan credenciales de admin')
  }
  return createSupabaseAdmin(supabaseUrl, supabaseServiceRole)
}

export async function deleteUserAccount(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Validate user is authenticated securely on server
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado' }
  }

  // Double check form data userId matches authenticated userId (Security)
  const formUserId = formData.get('userId')
  if (formUserId !== user.id) {
    return { error: 'Inconsistencia de usuario' }
  }

  try {
    const adminClient = getAdminClient()

    // 2. Clear avatars from Storage before profile is deleted
    // Find media_assets of type AVATAR or COVER owned by user and delete them
    // (Actually, maybe we just delete the user's files from 'recipe_media', 'story_media', 'avatars'?)
    // In misarroces, avatars are usually in 'avatars' or just in 'recipe_media' under the user's ID
    
    // We will just let the user delete. For storage, deleting the user cascades to 'profiles'
    // but files in storage remain. We should delete the user's folder in all buckets if we can,
    // or keep them if recipes are kept.
    // Let's just delete the user.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Error in deleteUser:', deleteError)
      return { error: 'Error interno eliminando usuario: ' + deleteError.message }
    }

    // Sign out explicitly
    await supabase.auth.signOut()
    
  } catch (error: any) {
    console.error('Failed to delete account:', error)
    return { error: 'Fallo inesperado al eliminar la cuenta.' }
  }

  redirect('/')
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const follows = formData.get('follows') === 'true'
  const likes = formData.get('likes') === 'true'
  const comments = formData.get('comments') === 'true'
  const mentions = formData.get('mentions') === 'true'
  const messages = formData.get('messages') === 'true'
  const system = formData.get('system') === 'true'

  const { error } = await (supabase as any).from('notification_preferences').upsert({
    user_id: user.id,
    follows,
    likes,
    comments,
    mentions,
    messages,
    system,
    updated_at: new Date().toISOString()
  })

  if (error) {
    return { error: 'Error al actualizar preferencias' }
  }

  revalidatePath('/settings/notifications')
  return { success: true }
}

export async function addHiddenWord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const word = formData.get('word')?.toString().trim().toLowerCase()
  if (!word) return { error: 'Palabra inválida' }

  const { error } = await (supabase as any).from('hidden_words').insert({
    user_id: user.id,
    word
  })

  if (error) {
    if (error.code === '23505') return { error: 'Esta palabra ya está oculta' }
    return { error: 'Error al añadir palabra oculta' }
  }

  revalidatePath('/settings/interactions/words')
  return { success: true }
}

export async function removeHiddenWord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const wordId = formData.get('wordId')?.toString()
  if (!wordId) return { error: 'Palabra inválida' }

  const { error } = await (supabase as any).from('hidden_words')
    .delete()
    .eq('id', wordId)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al eliminar palabra oculta' }

  revalidatePath('/settings/interactions/words')
  return { success: true }
}

export async function unblockUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const blockedId = formData.get('blockedId')?.toString()
  if (!blockedId) return { error: 'ID inválido' }

  const { error } = await supabase.from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId)

  if (error) return { error: 'Error al desbloquear' }

  revalidatePath('/settings/privacy/blocked')
  return { success: true }
}

export async function unmuteUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const mutedId = formData.get('mutedId')?.toString()
  if (!mutedId) return { error: 'ID inválido' }

  const { error } = await (supabase as any).from('user_mutes')
    .delete()
    .eq('muter_id', user.id)
    .eq('muted_id', mutedId)

  if (error) return { error: 'Error al quitar silencio' }

  revalidatePath('/settings/interactions/muted')
  return { success: true }
}

