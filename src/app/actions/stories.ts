// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createStory(data: {
  mediaId?: string
  caption?: string
  recipeId?: string
  sessionId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: story, error } = await supabase.from("stories").insert({
    owner_id: user.id,
    caption: data.caption || null,
    recipe_id: data.recipeId || null,
    session_id: data.sessionId || null,
    visibility: "PUBLIC"
  }).select().single()

  if (error || !story) {
    console.error("Error creating story:", error)
    throw new Error("Failed to create story")
  }

  if (data.mediaId) {
    await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    })
  }

  revalidatePath("/")
  return story
}
