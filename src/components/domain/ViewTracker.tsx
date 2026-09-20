"use client"

import { useEffect, useRef } from "react"
import { trackViewAction } from "@/app/actions/tracking"
import { sendGAEvent } from "@/lib/analytics/ga4"

export function ViewTracker({ eventType, entityType, entityId, ownerId }: { eventType: string, entityType: string, entityId: string, ownerId: string }) {
  const tracked = useRef(false)
  
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackViewAction(eventType, entityType, entityId, ownerId)
      
      // GA4 Mapping
      if (entityType === "RECIPE") {
        sendGAEvent("view_item", { content_type: "recipe", item_id: entityId })
      } else if (entityType === "PROFILE") {
        sendGAEvent("view_profile", { user_id_viewed: entityId })
      }
    }
  }, [eventType, entityType, entityId, ownerId])

  return null
}
