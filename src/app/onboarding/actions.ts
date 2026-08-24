"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function completeProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const username = formData.get("username") as string
  const displayName = formData.get("display_name") as string

  // Insert profile
  const { error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: username.toLowerCase().trim(),
      display_name: displayName.trim(),
      account_type: "USER",
      privacy_level: "PUBLIC",
    })

  if (error) {
    // If username is taken or validation fails
    if (error.code === '23505') {
      redirect("/onboarding?error=El nombre de usuario ya está en uso")
    }
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/cookbook")
}
