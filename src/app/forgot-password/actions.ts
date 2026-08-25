"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string
  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get("host") || "misarroces.es"
  const protocol = host.includes("localhost") ? "http" : "https"
  const siteUrl = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) {
    // We intentionally don't reveal if the email exists or not per security best practices.
    // Supabase usually handles this cleanly, but we'll always show success anyway.
    console.error("Reset password error:", error.message)
  }

  redirect(`/forgot-password?message=Si el correo existe, hemos enviado un enlace para recuperar tu contraseña.`)
}
