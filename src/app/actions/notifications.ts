"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendPushToUser } from "@/lib/push"

type NotificationType = Database["public"]["Enums"]["notification_type_enum"]

function formatPushMessage(
  type: NotificationType,
  actorName: string,
  entity_type: string,
  payload?: any
): { title: string; body: string } {
  const name = actorName || "Alguien"
  const title = "misarroces"

  switch (type) {
    case "LIKE":
      return {
        title,
        body: `${name} indicó que le gusta tu ${entity_type === "recipe" ? "receta" : "publicación"}.`,
      }
    case "COMMENT":
      return {
        title,
        body: `${name} comentó en tu ${entity_type === "recipe" ? "receta" : "publicación"}.`,
      }
    case "REPLY":
      return { title, body: `${name} respondió a tu comentario.` }
    case "MENTION":
      return { title, body: `${name} te mencionó.` }
    case "TAG":
      return { title, body: `${name} te etiquetó.` }
    case "FOLLOW":
      return { title, body: `${name} empezó a seguirte.` }
    case "FOLLOW_REQUEST":
      return { title, body: `${name} quiere seguirte.` }
    case "FOLLOW_ACCEPT":
      return { title, body: `${name} aceptó tu solicitud.` }
    case "COOKED_RECIPE":
      return { title, body: `${name} ha cocinado tu receta.` }
    case "NEW_MESSAGE": {
      const msgType = payload?.message_type
      if (msgType === "AUDIO") return { title, body: `${name} te envió una nota de voz.` }
      if (msgType === "IMAGE" || msgType === "VIDEO") return { title, body: `${name} te envió un archivo adjunto.` }
      return { title, body: `${name} te envió un mensaje.` }
    }
    case "SYSTEM":
      return {
        title: payload?.title || title,
        body: payload?.body || payload?.message || "Nueva notificación en misarroces",
      }
    default:
      return { title, body: `${name} interactuó contigo.` }
  }
}

function resolveNotificationUrl(
  type: NotificationType,
  actorUsername: string | null,
  actorId: string,
  entity_type: string,
  entity_id: string,
  payload?: any
): string {
  if (type === "NEW_MESSAGE") {
    const cid = payload?.conversation_id || entity_id
    return `/messages/${cid}`
  }
  if (type === "FOLLOW" || type === "FOLLOW_ACCEPT") {
    return actorUsername ? `/@${actorUsername}` : `/${actorId}`
  }
  if (type === "FOLLOW_REQUEST") {
    return `/profile/requests`
  }
  if (type === "COOKED_RECIPE") {
    return `/sessions/${entity_id}`
  }
  if (type === "SYSTEM") {
    return payload?.url || "/"
  }

  if (entity_type === "recipe") return `/recipes/${entity_id}`
  if (entity_type === "session") return `/sessions/${entity_id}`
  if (entity_type === "post") return `/posts/${entity_id}`
  if (entity_type === "short") return `/shorts`
  if (entity_type === "story") return `/profile`

  return "/"
}

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
  if (type === 'SYSTEM') prefKey = 'system';
  
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

  // Fetch actor profile for push title/body
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", user.id)
    .single()

  const actorName = actorProfile?.display_name || actorProfile?.username || "Alguien"
  const { title: pushTitle, body: pushBody } = formatPushMessage(type, actorName, entity_type, payload)
  const pushUrl = resolveNotificationUrl(type, actorProfile?.username || null, user.id, entity_type, entity_id, payload)

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

      // Send push notification asynchronously in background
      sendPushToUser(recipient_id, {
        title: pushTitle,
        body: pushBody,
        url: pushUrl,
        tag: `notif-${type}-${entity_id}`,
      }).catch((err) => console.warn("[Push Dispatch Error]", err?.message || err))

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

  // Send push notification asynchronously in background
  sendPushToUser(recipient_id, {
    title: pushTitle,
    body: pushBody,
    url: pushUrl,
    tag: `notif-${type}-${entity_id}`,
  }).catch((err) => console.warn("[Push Dispatch Error]", err?.message || err))
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, unreadCount: 0 }

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('recipient_id', user.id)

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return { success: true, unreadCount: count || 0 }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, unreadCount: 0 }

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return { success: true, unreadCount: 0 }
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



