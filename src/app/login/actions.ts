"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // After login, check if user has a profile
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (!profile) {
      // Auto-create missing profile
      await supabase.from("profiles").insert({
        id: user.id,
        username: `arrocero${Math.floor(Math.random() * 1000000)}`,
        display_name: 'Chef Arrocero',
        account_type: 'PERSONAL',
        privacy_level: 'PUBLIC'
      })
    }
  }

  revalidatePath("/", "layout")
  redirect("/cookbook")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'}/auth/callback?next=/cookbook` }
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // Generate an automatic username
    const autoUsername = `arrocero${Math.floor(Math.random() * 1000000)}`
    
    // Attempt to insert the profile. We ignore the error here because if it fails due to UNIQUE constraint, 
    // it just means another random collision, but the user is already authenticated.
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: autoUsername,
      display_name: 'Chef Arrocero',
      account_type: 'PERSONAL',
      privacy_level: 'PUBLIC'
    })
  }

  revalidatePath("/", "layout")
  if (data.session) {
    redirect("/cookbook")
  } else {
    redirect("/login?message=Cuenta creada. Revisa tu correo para confirmar tu cuenta.")
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

