import webpush from "web-push"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

// Ensure VAPID is configured once on server
let isVapidConfigured = false

function setupVapid() {
  if (isVapidConfigured) return true

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || "mailto:soporte@misarroces.com"

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not configured. Push notifications will be disabled.")
    return false
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  isVapidConfigured = true
  return true
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !adminKey) {
    throw new Error("[Push] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client")
  }
  return createAdminClient<Database>(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
  data?: Record<string, any>
  unreadCount?: number
}

/**
 * Sends a Web Push notification to all active devices registered by recipientId.
 * Automatically computes the exact unread count from the 'notifications' table,
 * sets the badge count, and purges expired subscriptions (HTTP 404 / 410).
 */
export async function sendPushToUser(
  recipientId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  if (!setupVapid()) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const adminClient = getAdminClient()

  // 1. Fetch exact unread count from SSOT notifications table
  const { count: unreadCount } = await adminClient
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .eq("is_read", false)

  const finalPayload: PushNotificationPayload = {
    ...payload,
    unreadCount: unreadCount ?? 1,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192.png",
  }

  // 2. Fetch all registered subscriptions for this user
  const { data: subscriptions, error: subsError } = await adminClient
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", recipientId)

  if (subsError || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  let sent = 0
  let failed = 0
  let cleaned = 0

  const stringPayload = JSON.stringify(finalPayload)

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      try {
        await webpush.sendNotification(pushConfig, stringPayload, {
          TTL: 60 * 60 * 24, // 24 hours
          urgency: "high",
        })
        sent++
      } catch (err: any) {
        failed++
        const statusCode = err?.statusCode

        // 3. Purge invalid or expired subscriptions (404 Not Found or 410 Gone)
        if (statusCode === 404 || statusCode === 410) {
          console.log(`[Push] Removing expired subscription endpoint: ${sub.endpoint.slice(0, 30)}...`)
          await adminClient
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id)
          cleaned++
        } else {
          console.warn(`[Push] Error delivering push notification:`, err?.message || err)
        }
      }
    })
  )

  return { sent, failed, cleaned }
}
