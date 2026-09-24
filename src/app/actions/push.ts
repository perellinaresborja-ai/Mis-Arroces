"use server"

import { createClient } from "@/lib/supabase/server"

export interface SerializedPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Registers or updates a push subscription for the currently authenticated user.
 */
export async function registerPushSubscription(
  subscription: SerializedPushSubscription,
  userAgent?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return { error: "Datos de suscripción incompletos" }
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    )

  if (error) {
    console.error("[Push Action] Error saving subscription:", error)
    return { error: "Error al registrar la suscripción push" }
  }

  return { success: true }
}

/**
 * Unregisters a push subscription for the current user.
 */
export async function unregisterPushSubscription(endpoint: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  if (!endpoint) {
    return { error: "Endpoint requerido" }
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)

  if (error) {
    console.error("[Push Action] Error removing subscription:", error)
    return { error: "Error al eliminar la suscripción push" }
  }

  return { success: true }
}

/**
 * Checks whether a given endpoint is currently registered for the current user.
 */
export async function isSubscriptionActive(endpoint: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !endpoint) return false

  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)
    .maybeSingle()

  return !!data
}
