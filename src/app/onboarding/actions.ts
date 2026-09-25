"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  normalizeUsername,
  validateUsernameFormat,
  isUsernameAvailable,
} from "@/lib/username"
import {
  normalizeDisplayName,
  validateDisplayNameFormat,
  isDisplayNameAvailable,
} from "@/lib/identity"
import { isAuthorizedOfficialAccount } from "@/lib/admin/auth"

export async function checkUsernameAvailabilityAction(username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAuthorizedAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()
    isAuthorizedAdmin = await isAuthorizedOfficialAccount(user.id, user.email, profile?.username)
  }

  const clean = normalizeUsername(username)
  const validation = validateUsernameFormat(clean, { isAuthorizedAdmin })
  if (!validation.valid) {
    return { available: false, error: validation.error }
  }

  const available = await isUsernameAvailable(supabase, clean, user?.id)
  if (!available) {
    return { available: false, error: "Este nombre de usuario ya está en uso" }
  }

  return { available: true }
}

export async function checkDisplayNameAvailabilityAction(displayName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const trimmed = (displayName || "").trim()
  if (!trimmed) {
    return { available: false, error: "El nombre es obligatorio." }
  }

  const validation = validateDisplayNameFormat(trimmed)
  if (!validation.valid) {
    return { available: false, error: validation.error }
  }

  const available = await isDisplayNameAvailable(supabase, trimmed, user?.id)
  if (!available) {
    return { available: false, error: "Este nombre ya está en uso." }
  }

  return { available: true }
}

export async function updateOnboardingProfile({ username, displayName }: { username: string, displayName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const cleanUsername = normalizeUsername(username)
  const isAuthorizedAdmin = await isAuthorizedOfficialAccount(user.id, user.email)
  const validation = validateUsernameFormat(cleanUsername, { isAuthorizedAdmin })
  if (!validation.valid) {
    return { error: validation.error }
  }

  // Check if username is taken by someone else (case-insensitive)
  const availableUser = await isUsernameAvailable(supabase, cleanUsername, user.id)
  if (!availableUser) {
    return { error: "Este nombre de usuario ya está en uso" }
  }

  const cleanDisplayName = (displayName || "").trim()
  if (!cleanDisplayName) {
    return { error: "El nombre es obligatorio." }
  }

  const formatValidation = validateDisplayNameFormat(cleanDisplayName)
  if (!formatValidation.valid) {
    return { error: formatValidation.error }
  }

  const availableDisplay = await isDisplayNameAvailable(supabase, cleanDisplayName, user.id)
  if (!availableDisplay) {
    return { error: "Este nombre ya está en uso." }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ 
      id: user.id,
      username: cleanUsername,
      display_name: cleanDisplayName,
      account_type: 'PERSONAL',
      privacy_level: 'PUBLIC'
    }, { onConflict: 'id' })

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
