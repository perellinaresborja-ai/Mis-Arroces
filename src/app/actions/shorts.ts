"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createShort(data: {
  mediaId: string
  caption?: string
  recipeId?: string
  sessionId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: short, error } = await supabase.from("shorts").insert({
    owner_id: user.id,
    caption: data.caption || null,
    recipe_id: data.recipeId || null,
    session_id: data.sessionId || null,
    visibility: "PUBLIC"
  }).select().single()

  if (error || !short) {
    console.error("Error creating short:", error)
    throw new Error("Failed to create short")
  }

  await supabase.from("short_media").insert({
    short_id: short.id,
    media_id: data.mediaId,
    display_order: 0
  })

  revalidatePath("/shorts")
  revalidatePath("/")
  return short
}