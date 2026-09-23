import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendFounderEmail } from "@/lib/email"

export async function processFounderSpotAndEmail(
  userId: string,
  userEmail?: string
): Promise<{ success: boolean; founderNumber?: number; alreadySent?: boolean; error?: string }> {
  if (!userId) return { success: false, error: "No user ID provided" }

  try {
    const supabase = await createClient()

    // 1. Intentar reclamar la plaza atómicamente si no la tiene
    const { data: claimedNumber, error: founderErr } = await supabase.rpc('claim_founder_spot', { p_user_id: userId })

    let founderNumber: number | null = null
    let needsEmail = false

    if (!founderErr && typeof claimedNumber === 'number' && claimedNumber >= 0 && claimedNumber <= 99) {
      founderNumber = claimedNumber
      needsEmail = true
    } else if (claimedNumber === -1) {
      // El usuario ya era fundador en la base de datos.
      // Comprobar si quedó pendiente el email de bienvenida (por fallo de red o error de Resend en el primer intento)
      const { data: founderRow } = await supabase
        .from('founders')
        .select('founder_number, welcome_email_sent_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (founderRow && founderRow.founder_number >= 0 && founderRow.founder_number <= 99) {
        if (!founderRow.welcome_email_sent_at) {
          founderNumber = founderRow.founder_number
          needsEmail = true
        } else {
          // Ya tiene el email enviado, nada más que hacer (idempotente)
          return { success: true, founderNumber: founderRow.founder_number, alreadySent: true }
        }
      }
    }

    if (!needsEmail || founderNumber === null) {
      return { success: true }
    }

    // 2. Obtener email de destino
    let targetEmail = userEmail
    if (!targetEmail) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id === userId && user.email) {
        targetEmail = user.email
      }
    }

    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!targetEmail && adminKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, adminKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
      targetEmail = authUser?.user?.email
    }

    if (!targetEmail) {
      console.error(`[FOUNDERS] No se encontró email para el usuario ${userId} asignado con plaza #${founderNumber}`)
      return { success: false, error: "User email not found", founderNumber }
    }

    // 3. Obtener perfil e identidad pública
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', userId)
      .maybeSingle()

    const { data: identityCode } = await supabase.rpc('get_or_create_user_identity', { p_user_id: userId })

    const cleanUsername = profile?.username ? profile.username.replace(/^@/, '') : undefined
    const displayName = profile?.display_name || (cleanUsername ? `@${cleanUsername}` : undefined)
    const publicCode = typeof identityCode === 'string' ? identityCode : cleanUsername

    // 4. Enviar email oficial de Arrocero Fundador
    const emailResult = await sendFounderEmail(targetEmail, founderNumber, {
      displayName,
      username: cleanUsername,
      publicCode,
    })

    if (emailResult?.error) {
      console.error(`[FOUNDERS] Error de Resend para #${founderNumber} (${targetEmail}):`, emailResult.error)
      return { success: false, error: JSON.stringify(emailResult.error), founderNumber }
    }

    // 5. Actualizar welcome_email_sent_at en la base de datos
    const dbClient = (adminKey && supabaseUrl)
      ? createAdminClient(supabaseUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : supabase

    const { error: updateErr } = await dbClient
      .from('founders')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('founder_number', founderNumber)

    if (updateErr) {
      console.error(`[FOUNDERS] Error al actualizar welcome_email_sent_at para #${founderNumber}:`, updateErr)
    } else {
      console.log(`[FOUNDERS] Email oficial enviado y welcome_email_sent_at registrado con éxito para #${founderNumber}`)
    }

    return { success: true, founderNumber, alreadySent: false }
  } catch (err: any) {
    console.error(`[FOUNDERS] Error no controlado en processFounderSpotAndEmail:`, err)
    return { success: false, error: err?.message || String(err) }
  }
}
