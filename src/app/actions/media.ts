"use server"

import { createClient } from "@/lib/supabase/server"

export async function registerMediaAsset(storagePath: string, mimeType: string, bucket: string = "recipe_media") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Server-side validation of file size
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
  
  try {
    const headRes = await fetch(publicUrl, { method: "HEAD" })
    const size = parseInt(headRes.headers.get("content-length") || "0", 10)
    
    const isVideo = mimeType.startsWith("video/")
    const maxSize = (isVideo ? 50 : 15) * 1024 * 1024

    if (size > maxSize) {
      // Clean up the oversized file
      await supabase.storage.from(bucket).remove([storagePath])
      throw new Error(`El archivo supera el límite (Max ${isVideo ? 50 : 15}MB).`)
    }
  } catch (err: any) {
    console.error("Size validation failed", err)
    if (err.message?.includes("límite")) throw err;
  }

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
