"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  normalizeUsername,
  validateUsernameFormat,
  isUsernameAvailable,
  generateAvailableUsername,
} from "@/lib/username"

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
  const available = await isUsernameAvailable(supabase, cleanUsername, user.id)
  if (!available) {
    return { error: "Este nombre de usuario ya está en uso" }
  }

  const cleanDisplayName = (displayName || "").trim()

  const { error } = await supabase
    .from("profiles")
    .update({ 
      username: cleanUsername,
      display_name: cleanDisplayName || null
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile in onboarding:", error)
    if (error.code === "23505") {
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
