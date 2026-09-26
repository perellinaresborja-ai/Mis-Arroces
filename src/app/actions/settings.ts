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

    // 2. Clear files from Storage before profile is deleted
    
    // 2a. Media Assets (recipes, stories, avatars, posts)
    const { data: assets } = await adminClient.from('media_assets')
      .select('storage_path')
      .eq('owner_id', user.id)
    
    if (assets && assets.length > 0) {
      const paths = assets.map(a => a.storage_path)
      const buckets = ['recipe_media', 'story_media']
      // We try deleting from both buckets as media_assets doesn't specify which
      // Ignoring errors if file doesn't exist in one of them
      for (const bucket of buckets) {
        await adminClient.storage.from(bucket).remove(paths)
      }
    }

    // 2b. Message Attachments
    const { data: msgs } = await adminClient.from('messages')
      .select('message_attachments(storage_path)')
      .eq('sender_id', user.id)
      
    if (msgs && msgs.length > 0) {
      const msgPaths = msgs.flatMap(m => m.message_attachments.map(a => a.storage_path))
      if (msgPaths.length > 0) {
        await adminClient.storage.from('message_media').remove(msgPaths)
      }
    }

    // 3. Delete the user
    // This triggers ON DELETE CASCADE in PostgreSQL for profiles, recipes, messages, etc.
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

  revalidatePath('/', 'layout')
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

  const { error } = await supabase.from('notification_preferences').upsert({
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

  const { error } = await supabase.from('hidden_words').insert({
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

  const { error } = await supabase.from('hidden_words')
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

  const { error } = await supabase.from('user_mutes')
    .delete()
    .eq('muter_id', user.id)
    .eq('muted_id', mutedId)

  if (error) return { error: 'Error al quitar silencio' }

  revalidatePath('/settings/interactions/muted')
  return { success: true }
}

export async function muteUser(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  if (user.id === targetUserId) throw new Error("No puedes silenciarte a ti mismo")

  const { error } = await supabase.from('user_mutes').insert({
    muter_id: user.id,
    muted_id: targetUserId
  })

  if (error && error.code !== '23505') {
    throw new Error("Error al silenciar usuario: " + error.message)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/settings/interactions/muted')
  return { success: true, isMuted: true }
}

export async function toggleMuteUser(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  if (user.id === targetUserId) throw new Error("No puedes silenciarte a ti mismo")

  const { data: existing } = await supabase
    .from('user_mutes')
    .select('id')
    .eq('muter_id', user.id)
    .eq('muted_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('user_mutes').delete().eq('id', existing.id)
    revalidatePath('/', 'layout')
    revalidatePath('/settings/interactions/muted')
    return { isMuted: false }
  } else {
    await supabase.from('user_mutes').insert({
      muter_id: user.id,
      muted_id: targetUserId
    })
    revalidatePath('/', 'layout')
    revalidatePath('/settings/interactions/muted')
    return { isMuted: true }
  }
}

export async function unblockUserById(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  await supabase.from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetUserId)

  revalidatePath('/', 'layout')
  revalidatePath('/settings/privacy/blocked')
  return { success: true }
}


