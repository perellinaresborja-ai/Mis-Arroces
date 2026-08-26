"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function updateOnboardingProfile({ username, displayName }: { username: string, displayName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  // Check if username is taken by someone else
  if (username) {
    const { data: existing } = await supabase.from("profiles").select("id").eq("username", username).not("id", "eq", user.id).single()
    if (existing) {
      return { error: "Este usuario ya está en uso" }
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      username: username || user.id.slice(0, 8),
      display_name: displayName || null
    })
    .eq("id", user.id)

  if (error) {
    console.error(error)
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
