import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function trackEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  _ownerIdClient?: string // Ignored for security, resolved in DB
) {
  try {
    const supabase = await createClient()

    // 1. Visitor ID logic
    const cookieStore = await cookies()
    let visitorId = cookieStore.get('misarroces_visitor_id')?.value
    if (!visitorId) {
      visitorId = uuidv4()
      cookieStore.set('misarroces_visitor_id', visitorId, { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax'
      })
    }

    // 2. Delegate to Secure RPC
    // The RPC will handle:
    // - owner_id resolution from DB source of truth
    // - deduplication bypassing RLS correctly (using SECURITY DEFINER)
    // - secure insert without exposing direct table INSERT to clients
    await supabase.rpc('track_analytics_event', {
      event_type_param: eventType,
      entity_type_param: entityType,
      entity_id_param: entityId,
      visitor_id_param: visitorId
    })

  } catch (error) {
    // Best-effort tracking, do not throw
    console.error("[Analytics] Error tracking event:", error)
  }
}
