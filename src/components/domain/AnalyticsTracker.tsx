"use client"

import { useEffect } from "react"
import { sendGAEvent } from "@/lib/analytics/ga4"

export function AnalyticsTracker({ eventName, params }: { eventName: string, params?: Record<string, any> }) {
  useEffect(() => {
    sendGAEvent(eventName, params)
  }, [eventName, params])
  return null
}
