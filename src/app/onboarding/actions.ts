"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  normalizeUsername,
  validateUsernameFormat,
  isUsernameAvailable,
  generateAvailableUsername,
} from "@/lib/username"
import {
  normalizeDisplayName,
  validateDisplayNameFormat,
  isDisplayNameAvailable,
} from "@/lib/identity"

export async function checkUsernameAvailabilityAction(username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { available: false, error: "No autorizado" }

  const clean = normalizeUsername(username)
  const validation = validateUsernameFormat(clean)
  if (!validation.valid) {
    return { available: false, error: validation.error }
  }

  const available = await isUsernameAvailable(supabase, clean, user.id)
  if (!available) {
    return { available: false, error: "Este nombre de usuario ya está en uso" }
  }

  return { available: true }
}

export async function checkDisplayNameAvailabilityAction(displayName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { available: false, error: "No autorizado" }

  const trimmed = (displayName || "").trim()
  if (!trimmed) {
    return { available: true } // optional in onboarding, defaults to username if empty
  }

  const validation = validateDisplayNameFormat(trimmed)
  if (!validation.valid) {
    return { available: false, error: validation.error }
  }

  const available = await isDisplayNameAvailable(supabase, trimmed, user.id)
  if (!available) {
    return { available: false, error: "Este nombre ya está en uso." }
  }

  return { available: true }
}

export async function getSuggestedUsernameAction() {
  const supabase = await createClient()
  const suggestion = await generateAvailableUsername(supabase, "arrocero")
  return { suggestion }
}

export async function updateOnboardingProfile({ username, displayName }: { username: string, displayName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const cleanUsername = normalizeUsername(username)
  const validation = validateUsernameFormat(cleanUsername)
  if (!validation.valid) {
    return { error: validation.error }
  }

  // Check if username is taken by someone else (case-insensitive)
  const availableUser = await isUsernameAvailable(supabase, cleanUsername, user.id)
  if (!availableUser) {
    return { error: "Este nombre de usuario ya está en uso" }
  }

  const cleanDisplayName = (displayName || "").trim()
  const effectiveDisplayName = cleanDisplayName || cleanUsername

  // Check if display name is taken by someone else (normalized)
  const formatValidation = validateDisplayNameFormat(effectiveDisplayName)
  if (!formatValidation.valid) {
    return { error: formatValidation.error }
  }

  const availableDisplay = await isDisplayNameAvailable(supabase, effectiveDisplayName, user.id)
  if (!availableDisplay) {
    return { error: "Este nombre ya está en uso." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      username: cleanUsername,
      display_name: effectiveDisplayName
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile in onboarding:", error)
    if (error.code === "23505") {
      if (error.message?.includes("display_name") || error.details?.includes("display_name")) {
        return { error: "Este nombre ya está en uso." }
      }
      return { error: "Este nombre de usuario ya está en uso" }
    }
    return { error: "Error al actualizar perfil" }
  }

  return { success: true }
}

export async function completeOnboardingAction(inviteCode: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  // Update onboarding status
  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id)

  // Handle referral if inviteCode provided
  if (inviteCode) {
    // Check if already referred
    const { data: existingRef } = await supabase.from("invite_referrals").select("id").eq("invited_user_id", user.id).single()
    
    if (!existingRef) {
      // Get inviter
      const { data: inviter } = await supabase.from("profiles").select("id").eq("invite_code", inviteCode).single()
      if (inviter && inviter.id !== user.id) {
        // Insert referral
        await supabase.from("invite_referrals").insert({
          inviter_id: inviter.id,
          invited_user_id: user.id
        })
      }
    }
  }

  // Clear invite cookie
  const cookieStore = await cookies()
  cookieStore.delete("misarroces_invite_code")

  return { success: true }
}
