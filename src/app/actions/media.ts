"use server"

import { createClient } from "@/lib/supabase/server"

export async function registerMediaAsset(storagePath: string, mimeType: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: asset, error } = await supabase
    .from("media_assets")
    .insert({
      owner_id: user.id,
      storage_path: storagePath,
      media_type: mimeType.startsWith("video/") ? "VIDEO" : "IMAGE",
      mime_type: mimeType,
    })
    .select()
    .single()

  if (error || !asset) {
    console.error(error)
    throw new Error("Failed to register media asset")
  }

  return asset.id
}
