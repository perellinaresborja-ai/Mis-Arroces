"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { createClient as createAdminClient } from "@supabase/supabase-js"

type NotificationType = Database["public"]["Enums"]["notification_type_enum"]

export async function createNotification(
  recipient_id: string,
  type: NotificationType,
  entity_type: string,
  entity_id: string,
  payload?: any
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id === recipient_id) return // Don't notify yourself

  // Check user preferences
  let prefKey = null;
  if (type === 'FOLLOW' || type === 'FOLLOW_REQUEST' || type === 'FOLLOW_ACCEPT') prefKey = 'follows';
  if (type === 'LIKE') prefKey = 'likes';
  if (type === 'COMMENT' || type === 'REPLY') prefKey = 'comments';
  if (type === 'MENTION' || type === 'TAG') prefKey = 'mentions';
  if (type === 'NEW_MESSAGE') prefKey = 'messages';
  if ((type as string) === 'SYSTEM') prefKey = 'system';
  
  if (prefKey) {
    const { data: prefs } = await supabase.from('notification_preferences')
      .select(prefKey)
      .eq('user_id', recipient_id)
      .single()
      
    // Validate with typed key access
    const prefsData = prefs as Record<string, any>;
    if (prefsData && prefsData[prefKey] === false) {
      return // User opted out
    }
  }

  // Deduplication check for repeatable actions
  if (type === 'LIKE' || type === 'FOLLOW' || type === 'FOLLOW_REQUEST') {
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const dbClient = (adminKey && supabaseUrl)
      ? createAdminClient(supabaseUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : supabase

    const { data: existing } = await dbClient
      .from('notifications')
      .select('id')
      .eq('recipient_id', recipient_id)
      .eq('actor_id', user.id)
      .eq('type', type)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      // Just mark it as unread again and update timestamp
      await dbClient
        .from('notifications')
        .update({ is_read: false, created_at: new Date().toISOString() })
        .eq('id', existing.id)
      return
    }
  }

  await supabase.from('notifications').insert({
    recipient_id,
    actor_id: user.id,
    type,
    entity_type,
    entity_id,
    payload
  })
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('recipient_id', user.id)
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)
}

export async function fetchNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(
        id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)
      )
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}



