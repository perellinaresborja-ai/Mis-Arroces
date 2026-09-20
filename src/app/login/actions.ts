"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { generateAvailableUsername } from "@/lib/username"

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get("email") as string || "").trim()
  const password = (formData.get("password") as string || "")

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Por favor, introduce tu email y contraseña.")}`)
  }

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
      // Auto-create missing profile with guaranteed unique username
      const autoUsername = await generateAvailableUsername(supabase, "arrocero")
      await supabase.from("profiles").insert({
        id: user.id,
        username: autoUsername,
        display_name: 'Chef Arrocero',
        account_type: 'PERSONAL',
        privacy_level: 'PUBLIC'
      })
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get("email") as string || "").trim()
  const password = (formData.get("password") as string || "")

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Por favor, introduce un correo y una contraseña para crear tu cuenta.")}`)
  }

  if (password.length < 6) {
    redirect(`/login?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres.")}`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${baseUrl}/auth/callback?next=/` }
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // Generate a guaranteed unique automatic username
    const autoUsername = await generateAvailableUsername(supabase, "arrocero")
    
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: autoUsername,
      display_name: 'Chef Arrocero',
      account_type: 'PERSONAL',
      privacy_level: 'PUBLIC'
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(data.user.email!).catch(err =>
      console.error('Welcome email failed:', err)
    )
  }

  revalidatePath("/", "layout")
  if (data.session) {
    redirect("/")
  } else {
    redirect("/login?message=Cuenta creada. Revisa tu correo para confirmar tu cuenta.")
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

