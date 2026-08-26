"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    redirect(`/update-password?error=Las contraseñas no coinciden.`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
  }

  // Deslogueamos por seguridad o forzamos re-login con la nueva
  await supabase.auth.signOut()

  redirect(`/login?message=Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.`)
}
