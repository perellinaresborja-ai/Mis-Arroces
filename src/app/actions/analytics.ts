import { createClient } from "@/lib/supabase/server"

export async function trackEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  ownerId: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Do not fail if no user, just insert actor_id as null
    await supabase.from("analytics_events").insert({
      actor_id: user?.id || null,
      owner_id: ownerId,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId
    })
  } catch (error) {
    // Best-effort tracking, do not throw
    console.error("[Analytics] Error tracking event:", error)
  }
}
