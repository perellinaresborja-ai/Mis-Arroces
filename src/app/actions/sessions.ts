"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/app/actions/notifications"
import { trackEvent } from "@/app/actions/analytics"
import { redirect } from "next/navigation"

export async function createCookingSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const recipeId = formData.get("recipeId") as string
  const date = formData.get("date") as string || new Date().toISOString().split('T')[0]
  const actualServings = formData.get("actualServings") ? parseFloat(formData.get("actualServings") as string) : null
  const rating = formData.get("rating") ? parseInt(formData.get("rating") as string, 10) : null
  const socarratLevel = formData.get("socarratLevel") ? parseInt(formData.get("socarratLevel") as string, 10) : null
  const modifications = formData.get("modifications") as string || null
  const notes = formData.get("notes") as string || null
  const visibility = formData.get("visibility") as string || "PRIVATE"
  const status = formData.get("status") as string || "DRAFT"
  const scheduledFor = formData.get("scheduled_for") as string || null
  
  // Validate limits
  if (rating && (rating < 1 || rating > 5)) throw new Error("Invalid rating")
  if (socarratLevel && (socarratLevel < 1 || socarratLevel > 5)) throw new Error("Invalid socarrat level")

  const id = formData.get("id") as string // Provided from client
  
  const sessionData: any = {
    user_id: user.id,
    recipe_id: recipeId,
    date,
    rating,
    socarrat_level: socarratLevel,
    modifications,
    notes,
    actual_servings: actualServings,
    visibility: (visibility as "PUBLIC" | "PRIVATE" | "FOLLOWERS"),
    status,
    scheduled_for: scheduledFor
  }
  
  if (id) {
    sessionData.id = id
  }

  const { data: session, error } = await supabase.from("cooking_sessions").upsert(sessionData).select("id").single()

  if (error) {
    console.error("Error upserting session:", error)
    throw new Error("Failed to save session")
  }

  // Link Media
  const mediaIdsRaw = formData.get("media_ids") as string
  if (mediaIdsRaw && session.id) {
    try {
      const mediaIds = JSON.parse(mediaIdsRaw) as string[]
      
      // Delete old ones first
      await supabase.from("session_media").delete().eq("session_id", session.id)

      if (Array.isArray(mediaIds) && mediaIds.length > 0) {
        const mediaInserts = mediaIds.map((media_id, index) => ({
          session_id: session.id,
          media_id,
          display_order: index,
          is_primary: index === 0
        }))
        const { error: mediaError } = await supabase.from("session_media").insert(mediaInserts)
        if (mediaError) console.error("Error inserting session_media", mediaError)
      }
    } catch (e) {
      console.error("Failed to parse media_ids", e)
    }
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath("/cookbook")
  redirect(`/sessions/${session.id}`)
}
