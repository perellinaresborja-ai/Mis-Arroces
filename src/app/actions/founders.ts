'use server'

import { createClient } from "@/lib/supabase/server"
import { sendFounderInvitationEmail } from "@/lib/email"

export async function sendFounderInvitationAction(
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = recipientEmail?.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Introduce un correo electrónico válido." }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Debes iniciar sesión para invitar a un arrocero." }
    }

    // 1. Comprobar que el usuario es Arrocero Fundador
    const { data: founder } = await supabase
      .from("founders")
      .select("founder_number")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!founder || typeof founder.founder_number !== "number" || founder.founder_number < 0 || founder.founder_number > 99) {
      return { success: false, error: "Esta invitación es exclusiva para los miembros de Los 100 Arroceros Fundadores." }
    }

    // 2. Obtener código público de identidad
    let publicCode: string | null = null
    const { data: identity } = await supabase
      .from("user_identities" as any)
      .select("public_code")
      .eq("user_id", user.id)
      .maybeSingle()

    if ((identity as any)?.public_code) {
      publicCode = (identity as any).public_code
    } else {
      const { data: code } = await (supabase.rpc as any)('get_or_create_user_identity', { p_user_id: user.id })
      if (code) publicCode = String(code)
    }

    // 3. Obtener nombre para mostrar del anfitrión
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .maybeSingle()

    const rawUsername = profile?.username ? profile.username.replace(/^@/, '') : ''
    let inviterName = profile?.display_name?.trim() || ''
    if (!inviterName && rawUsername) {
      inviterName = `@${rawUsername}`
    } else if (!inviterName) {
      inviterName = 'Un Arrocero Fundador'
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'
    const referralUrl = publicCode ? `${baseUrl}/fundadores/r/${publicCode}` : `${baseUrl}/fundadores`

    // 4. Enviar email HTML oficial con Resend
    const resendResult = await sendFounderInvitationEmail({
      to: cleanEmail,
      inviterName,
      referralUrl,
    })

    if (resendResult.error) {
      console.error("Error al enviar email de invitación por Resend:", resendResult.error)
      return { success: false, error: "No se pudo enviar el correo de invitación. Por favor, inténtalo más tarde." }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Error inesperado en sendFounderInvitationAction:", err)
    return { success: false, error: "Ha ocurrido un error inesperado al enviar la invitación." }
  }
}
