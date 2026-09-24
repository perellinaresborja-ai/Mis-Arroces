"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { generateAvailableUsername } from "@/lib/username"
import { normalizeEmail, getFriendlyAuthErrorMessage } from "@/lib/auth-messages"
import { syncCurrentSessionToVaultAction } from "@/app/actions/account-switcher"

export async function login(formData: FormData) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const email = normalizeEmail(formData.get("email") as string || "")
  const password = (formData.get("password") as string || "")

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Por favor, introduce tu email y contraseña.")}`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const userMessage = getFriendlyAuthErrorMessage(error, "login")
    redirect(`/login?error=${encodeURIComponent(userMessage)}`)
  }

  // After login, check if user has a profile
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    cookieStore.set("ma_has_account", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 730,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (!profile) {
      // Auto-create missing profile with guaranteed unique username & provisional display_name
      const autoUsername = await generateAvailableUsername(supabase, "arrocero")
      await supabase.from("profiles").insert({
        id: user.id,
        username: autoUsername,
        display_name: autoUsername,
        account_type: 'PERSONAL',
        privacy_level: 'PUBLIC'
      })
    }

    // Asegurar la cuenta recién iniciada en la bóveda multicuenta
    await syncCurrentSessionToVaultAction()
  }

  const returnCookie = cookieStore.get("misarroces_return_to")?.value
  const formRedirect = formData.get("redirect") as string
  const targetRedirect = formRedirect || returnCookie

  if (returnCookie) {
    cookieStore.delete("misarroces_return_to")
  }

  revalidatePath("/", "layout")
  if (targetRedirect && targetRedirect.startsWith("/") && !targetRedirect.startsWith("//")) {
    redirect(targetRedirect)
  } else {
    redirect("/?login=success")
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = normalizeEmail(formData.get("email") as string || "")
  const password = (formData.get("password") as string || "")
  const legalAccepted = formData.get("legal_accepted") === "on"
  const ageConfirmed = formData.get("age_18_confirmed") === "on"

  if (!legalAccepted) {
    redirect(`/login?error=${encodeURIComponent("Debes aceptar los Términos de servicio y confirmar que has leído la Política de privacidad.")}`)
  }

  if (!ageConfirmed) {
    redirect(`/login?error=${encodeURIComponent("Debes confirmar que eres mayor de 18 años para crear una cuenta.")}`)
  }

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Por favor, introduce un correo y una contraseña para crear tu cuenta.")}`)
  }

  if (password.length < 6) {
    redirect(`/login?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres.")}`)
  }

  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const returnCookie = cookieStore.get("misarroces_return_to")?.value
  const formRedirect = formData.get("redirect") as string
  const targetRedirect = formRedirect || returnCookie || ""

  if (returnCookie) {
    cookieStore.delete("misarroces_return_to")
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  const emailNext = (targetRedirect && targetRedirect.startsWith("/") && !targetRedirect.startsWith("//"))
    ? targetRedirect
    : "/create/recipe"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(emailNext)}` }
  })

  if (error) {
    const userMessage = getFriendlyAuthErrorMessage(error, "signup")
    redirect(`/login?error=${encodeURIComponent(userMessage)}`)
  }

  if (data.user) {
    cookieStore.set("ma_has_account", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 730,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })

    // Generate a guaranteed unique automatic username & provisional display_name
    const autoUsername = await generateAvailableUsername(supabase, "arrocero")
    
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: autoUsername,
      display_name: autoUsername,
      account_type: 'PERSONAL',
      privacy_level: 'PUBLIC'
    })

    // Register legal acceptances via secure RPC
    const { error: rpcError } = await (supabase.rpc as any)('accept_current_legal_documents')
    if (rpcError) {
      console.error('Failed to accept legal documents:', rpcError)
    }

    // Process acquisition data if present
    const acqDataRaw = formData.get("acquisition_data") as string
    if (acqDataRaw) {
      try {
        const acqData = JSON.parse(acqDataRaw)
        await (supabase as any).from("user_acquisition").insert({
          user_id: data.user.id,
          utm_source: acqData.utm_source,
          utm_medium: acqData.utm_medium,
          utm_campaign: acqData.utm_campaign,
          utm_content: acqData.utm_content,
          utm_term: acqData.utm_term,
          referrer: acqData.referrer,
          landing_path: acqData.landing_path
        })
      } catch (e) {
        console.error("Error inserting acquisition data", e)
      }
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(data.user.email!).catch(err =>
      console.error('Welcome email failed:', err)
    )
  }

  revalidatePath("/", "layout")
  if (data.session) {
    if (targetRedirect && targetRedirect.startsWith("/") && !targetRedirect.startsWith("//")) {
      redirect(targetRedirect)
    } else {
      redirect("/create/recipe")
    }
  } else {
    redirect(`/login?message=${encodeURIComponent("Cuenta creada. Revisa tu correo para confirmar tu cuenta.")}&signup=success`)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

