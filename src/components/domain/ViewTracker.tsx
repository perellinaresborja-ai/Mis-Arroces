"use client"

import { useEffect, useRef } from "react"
import { trackViewAction } from "@/app/actions/tracking"

export function ViewTracker({ eventType, entityType, entityId, ownerId }: { eventType: string, entityType: string, entityId: string, ownerId: string }) {
  const tracked = useRef(false)
  
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackViewAction(eventType, entityType, entityId, ownerId)
    }
  }, [eventType, entityType, entityId, ownerId])

  return null
}
