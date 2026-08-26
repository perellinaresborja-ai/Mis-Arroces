"use server"

import { trackEvent } from "./analytics"

export async function trackViewAction(eventType: string, entityType: string, entityId: string, ownerId: string) {
  await trackEvent(eventType, entityType, entityId, ownerId)
}

export async function trackClickAction(eventType: string, entityType: string, entityId: string, ownerId: string) {
  await trackEvent(eventType, entityType, entityId, ownerId)
}
