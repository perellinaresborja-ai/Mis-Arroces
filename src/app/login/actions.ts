"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { normalizeUsername, validateUsernameFormat, isUsernameAvailable } from "@/lib/username"
import { normalizeDisplayName, validateDisplayNameFormat, isDisplayNameAvailable } from "@/lib/identity"
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
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile) {
      const metaName = (user.user_metadata?.display_name || user.user_metadata?.full_name || "").trim()
      const metaUser = normalizeUsername(user.user_metadata?.username || "")

      if (metaName && metaUser) {
        await supabase.from("profiles").upsert({
          id: user.id,
          username: metaUser,
          display_name: metaName,
          account_type: 'PERSONAL',
          privacy_level: 'PUBLIC',
          onboarding_completed: true
        }, { onConflict: 'id' })
      } else {
        // Redirigir a onboarding para que defina su nombre y @usuario de forma explícita
        redirect("/onboarding")
      }
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
  const displayNameRaw = (formData.get("display_name") as string || "")
  const usernameRaw = (formData.get("username") as string || "")
  const legalAccepted = formData.get("legal_accepted") === "on"
  const ageConfirmed = formData.get("age_18_confirmed") === "on"

  if (!legalAccepted) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("Debes aceptar los Términos de servicio y confirmar que has leído la Política de privacidad.")}`)
  }

  if (!ageConfirmed) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("Debes confirmar que eres mayor de 18 años para crear una cuenta.")}`)
  }

  // Validación de Nombre obligatorio y único
  const cleanDisplayName = displayNameRaw.trim()
  if (!cleanDisplayName) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("El nombre es obligatorio.")}`)
  }
  const displayCheck = validateDisplayNameFormat(cleanDisplayName)
  if (!displayCheck.valid) {
    redirect(`/login?mode=signup&error=${encodeURIComponent(displayCheck.error || "El nombre no es válido.")}`)
  }
  const isDisplayAvail = await isDisplayNameAvailable(supabase, cleanDisplayName)
  if (!isDisplayAvail) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("El nombre introducido ya está en uso por otra cuenta.")}`)
  }

  // Validación de @usuario obligatorio y único
  const cleanUsername = normalizeUsername(usernameRaw)
  if (!cleanUsername) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("El nombre de usuario es obligatorio.")}`)
  }
  const usernameCheck = validateUsernameFormat(cleanUsername, { isAuthorizedAdmin: false })
  if (!usernameCheck.valid) {
    redirect(`/login?mode=signup&error=${encodeURIComponent(usernameCheck.error || "El nombre de usuario no es válido.")}`)
  }
  const isUserAvail = await isUsernameAvailable(supabase, cleanUsername)
  if (!isUserAvail) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("El nombre de usuario @" + cleanUsername + " ya está en uso.")}`)
  }

  if (!email || !password) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("Por favor, introduce un correo y una contraseña para crear tu cuenta.")}`)
  }

  if (password.length < 6) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres.")}`)
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
    options: {
      data: {
        display_name: cleanDisplayName,
        username: cleanUsername,
      },
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(emailNext)}`
    }
  })

  if (error) {
    const userMessage = getFriendlyAuthErrorMessage(error, "signup")
    redirect(`/login?mode=signup&error=${encodeURIComponent(userMessage)}`)
  }

  if (data.user) {
    cookieStore.set("ma_has_account", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 730,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })

    // Insertar perfil con el nombre y @usuario explícitamente escogidos por el usuario
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: cleanUsername,
      display_name: cleanDisplayName,
      account_type: 'PERSONAL',
      privacy_level: 'PUBLIC',
      onboarding_completed: true
    })

    if (profileError) {
      console.error("Error al crear perfil en registro:", profileError)
      if (profileError.code === "23505") {
        redirect(`/login?mode=signup&error=${encodeURIComponent("El nombre o @usuario ya está ocupado.")}`)
      }
      redirect(`/login?mode=signup&error=${encodeURIComponent("No se pudo crear el perfil. Inténtalo de nuevo.")}`)
    }

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

    // Sincronizar sesión en la bóveda multicuenta
    await syncCurrentSessionToVaultAction()
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

