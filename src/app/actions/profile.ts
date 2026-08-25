"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const username = formData.get("username") as string
  const display_name = formData.get("display_name") as string
  const bio = formData.get("bio") as string || null
  const location = formData.get("location") as string || null
  const website = formData.get("website") as string || null
  const privacy_level = formData.get("privacy_level") as string
  const mediaAssetId = formData.get("media_asset_id") as string || null
  const coverMediaId = formData.get("cover_media_id") as string || null
  
  // Need to check current profile first to see if username changed
  const { data: currentProfile } = await supabase.from("profiles").select("username, last_username_update").eq("id", user.id).single()

  const cleanUsername = username.toLowerCase().trim()
  
  const reservedNames = ['admin', 'administrator', 'misarroces', 'support', 'soporte', 'official', 'moderator', 'moderador', 'system']
  if (reservedNames.includes(cleanUsername) && currentProfile?.username !== cleanUsername) {
    throw new Error(`Este nombre de usuario no está disponible.`)
  }

  let updateData: any = {
    display_name: display_name ? display_name.trim() : null,
    bio,
    location,
    website,
    privacy_level: (privacy_level as "PUBLIC" | "PRIVATE" | "FOLLOWERS") || "PUBLIC"
  }

  if (mediaAssetId) {
    updateData.avatar_media_id = mediaAssetId
  }
  
  // if explicitly 'REMOVE', we set to null. If valid id, set it. Otherwise ignore.
  if (coverMediaId === 'REMOVE') {
    updateData.cover_media_id = null
  } else if (coverMediaId) {
    updateData.cover_media_id = coverMediaId
  }

  if (currentProfile?.username !== cleanUsername) {
    // Check 30 days cooldown
    if (currentProfile?.last_username_update) {
      const lastUpdate = new Date(currentProfile.last_username_update)
      const now = new Date()
      const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
      if (diffDays < 30) {
        throw new Error("Solo puedes cambiar de nombre de usuario una vez cada 30 días.")
      }
    }
    updateData.username = cleanUsername
    updateData.last_username_update = new Date().toISOString()
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    if (error.code === '23505') {
      throw new Error(`@${cleanUsername} ya está ocupado.`)
    }
    throw new Error(error.message)
  }
  
  if (currentProfile?.username !== cleanUsername && currentProfile?.username) {
    // Attempt to store alias, ignore failure if table doesn't exist yet
    // @ts-ignore
    await supabase.from("username_aliases").insert({
      profile_id: user.id,
      username: currentProfile.username
    })
  }

  revalidatePath("/profile")
  revalidatePath(`/@${cleanUsername}`)
  revalidatePath("/")
  redirect(`/@${cleanUsername}`)
}
