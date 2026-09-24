"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { normalizeUsername, validateUsernameFormat, isUsernameAvailable } from "@/lib/username"
import { validateDisplayNameFormat, isDisplayNameAvailable } from "@/lib/identity"
import { isAuthorizedOfficialAccount } from "@/lib/admin/auth"
import { syncCurrentSessionToVaultAction } from "@/app/actions/account-switcher"

export async function getMyHeaderData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles')
    .select(`avatar:media_assets!fk_profiles_avatar(storage_path)`)
    .eq('id', user.id)
    .single();

  const avatarPath = Array.isArray(data?.avatar) ? data.avatar[0]?.storage_path : data?.avatar?.storage_path;
  if (avatarPath) {
    return avatarPath.startsWith('http') ? avatarPath : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`
  }
  return null
}

export async function updateProfile(formData: FormData): Promise<{
  success: boolean
  username?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "No autorizado" }

    const username = formData.get("username") as string
    const display_name = formData.get("display_name") as string
    const bio = formData.get("bio") as string || null
    const location = formData.get("location") as string || null
    const website = formData.get("website") as string || null
    const privacy_level = formData.get("privacy_level") as string
    const mediaAssetId = formData.get("media_asset_id") as string || null
    const coverMediaId = formData.get("cover_media_id") as string || null
    
    // Need to check current profile first to see if username changed
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("username, last_username_update, display_name")
      .eq("id", user.id)
      .single()

    const cleanUsername = normalizeUsername(username)
    const cleanDisplayName = display_name ? display_name.trim() : null

    if (cleanDisplayName) {
      const formatCheck = validateDisplayNameFormat(cleanDisplayName)
      if (!formatCheck.valid) {
        return { success: false, error: formatCheck.error || "Nombre no válido." }
      }

      const availableDisplay = await isDisplayNameAvailable(supabase, cleanDisplayName, user.id)
      if (!availableDisplay) {
        return { success: false, error: "Este nombre ya está en uso." }
      }
    }

    let updateData: any = {
      display_name: cleanDisplayName,
      bio,
      location,
      website,
      privacy_level: (privacy_level as "PUBLIC" | "PRIVATE" | "FOLLOWERS") || "PUBLIC"
    }

    if (mediaAssetId) {
      updateData.avatar_media_id = mediaAssetId
    }
    
    if (coverMediaId === 'REMOVE') {
      updateData.cover_media_id = null
    } else if (coverMediaId) {
      updateData.cover_media_id = coverMediaId
    }
    
    if (cleanUsername && currentProfile?.username !== cleanUsername) {
      const isAuthorizedAdmin = await isAuthorizedOfficialAccount(user.id, user.email, currentProfile?.username)
      const validation = validateUsernameFormat(cleanUsername, { isAuthorizedAdmin })
      if (!validation.valid) {
        return { success: false, error: validation.error || "Nombre de usuario inválido." }
      }

      const available = await isUsernameAvailable(supabase, cleanUsername, user.id)
      if (!available) {
        return { success: false, error: "Este nombre de usuario ya está en uso" }
      }

      // Check 30 days cooldown (bypass for authorized admin when establishing brand identity)
      if (currentProfile?.last_username_update && !isAuthorizedAdmin) {
        const lastUpdate = new Date(currentProfile.last_username_update)
        const now = new Date()
        const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
        if (diffDays < 30) {
          return { success: false, error: "Solo puedes cambiar de nombre de usuario una vez cada 30 días." }
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
        if (error.message?.includes("display_name") || error.details?.includes("display_name")) {
          return { success: false, error: "Este nombre ya está en uso." }
        }
        return { success: false, error: "Este nombre de usuario ya está en uso" }
      }
      return { success: false, error: error.message || "Error al actualizar perfil." }
    }
    
    if (cleanUsername && currentProfile?.username !== cleanUsername && currentProfile?.username) {
      try {
        await supabase.from("username_aliases").insert({
          profile_id: user.id,
          username: currentProfile.username
        })
      } catch (aliasErr) {
        console.warn("Could not insert username alias:", aliasErr)
      }
    }

    // Synchronize vault cookies so the account switcher has the new name/avatar immediately
    try {
      await syncCurrentSessionToVaultAction()
    } catch (vaultErr) {
      console.warn("Could not sync vault after profile update:", vaultErr)
    }

    const finalUsername = cleanUsername || currentProfile?.username || ""
    revalidatePath("/profile")
    if (finalUsername) {
      revalidatePath(`/@${finalUsername}`)
    }
    revalidatePath("/")

    return {
      success: true,
      username: finalUsername
    }
  } catch (err: any) {
    console.error("Error in updateProfile action:", err)
    return {
      success: false,
      error: err.message || "Error al guardar el perfil."
    }
  }
}
