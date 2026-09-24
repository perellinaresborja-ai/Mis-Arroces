"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function checkPendingLegal(userId: string) {
  const supabase = await createClient()

  // Get active documents
  const { data: activeDocs } = await supabase
    .from("legal_documents" as any)
    .select("id, document_type")
    .eq("is_active", true)

  if (!activeDocs || activeDocs.length === 0) return false

  // Get user acceptances
  const { data: userAcceptances } = await supabase
    .from("user_legal_acceptances" as any)
    .select("document_id")
    .eq("user_id", userId)

  const acceptedIds = new Set(userAcceptances?.map((a: any) => a.document_id) || [])

  // Check if any active document is missing
  const missing = activeDocs.some((doc: any) => !acceptedIds.has(doc.id))
  
  return missing
}

export async function acceptActiveLegalDocuments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No user found")

  const { error } = await (supabase.rpc as any)('accept_current_legal_documents')
  
  if (error) {
    throw error
  }

  revalidatePath("/", "layout")
  return { success: true }
}

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendAccountDeletionVerificationEmail } from "@/lib/email"

export async function requestAccountDeletionAction(formData: {
  email: string
  username?: string
  reason?: string
  confirmed: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = formData.email?.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Por favor, introduce un correo electrónico válido." }
    }

    if (!formData.confirmed) {
      return { success: false, error: "Debes marcar la casilla confirmando que deseas solicitar la eliminación." }
    }

    // Generar código de seguridad de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (adminKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, adminKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      // Buscar si el usuario existe de forma segura
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      )

      if (existingUser) {
        // Guardar código temporal y fecha de expiración (30 min) en user_metadata de forma segura
        await adminClient.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            ...existingUser.user_metadata,
            deletion_request: {
              code: verificationCode,
              expiresAt: Date.now() + 30 * 60 * 1000,
            },
          },
        })

        // Obtener username si lo tiene
        const { data: profile } = await adminClient
          .from("profiles")
          .select("username, display_name")
          .eq("id", existingUser.id)
          .maybeSingle()

        const userDisplayName = profile?.display_name || profile?.username || formData.username || undefined

        // Enviar correo de verificación al titular
        await sendAccountDeletionVerificationEmail({
          to: cleanEmail,
          username: userDisplayName,
          verificationCode,
        })
      }
    }

    // Respuesta uniforme: no filtra si el correo existe o no en la plataforma (anti-enumeración)
    return { success: true }
  } catch (err: any) {
    console.error("Error en requestAccountDeletionAction:", err)
    return { success: false, error: "Ha ocurrido un error al procesar tu solicitud. Inténtalo de nuevo." }
  }
}

export async function confirmAccountDeletionAction(payload: {
  email: string
  code: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = payload.email?.trim().toLowerCase()
    const cleanCode = payload.code?.trim()

    if (!cleanEmail || !cleanCode || cleanCode.length !== 6) {
      return { success: false, error: "Por favor, introduce el código de 6 dígitos que has recibido por correo." }
    }

    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!adminKey || !supabaseUrl) {
      return { success: false, error: "Error de configuración en el servidor." }
    }

    const adminClient = createAdminClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError || !usersData?.users) {
      return { success: false, error: "No se ha podido procesar la verificación. Inténtalo de nuevo." }
    }

    const user = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    )

    if (!user) {
      return { success: false, error: "El código no es válido o ha expirado." }
    }

    const deletionRequest = user.user_metadata?.deletion_request
    if (
      !deletionRequest ||
      deletionRequest.code !== cleanCode ||
      Date.now() > Number(deletionRequest.expiresAt)
    ) {
      return {
        success: false,
        error: "El código introducido no es válido o ha expirado. Por favor, solicita uno nuevo.",
      }
    }

    // Proceder con la eliminación definitiva de recursos en Storage
    try {
      const { data: assets } = await adminClient
        .from("media_assets")
        .select("storage_path")
        .eq("owner_id", user.id)

      if (assets && assets.length > 0) {
        const paths = assets.map((a: any) => a.storage_path)
        const buckets = ["recipe_media", "story_media"]
        for (const bucket of buckets) {
          await adminClient.storage.from(bucket).remove(paths)
        }
      }

      const { data: msgs } = await adminClient
        .from("messages")
        .select("message_attachments(storage_path)")
        .eq("sender_id", user.id)

      if (msgs && msgs.length > 0) {
        const msgPaths = msgs.flatMap((m: any) =>
          (m.message_attachments || []).map((a: any) => a.storage_path)
        )
        if (msgPaths.length > 0) {
          await adminClient.storage.from("message_media").remove(msgPaths)
        }
      }
    } catch (storageErr) {
      console.warn("Aviso limpiando archivos multimedia en eliminación:", storageErr)
    }

    // Eliminación definitiva en auth (desencadena ON DELETE CASCADE en base de datos)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error("Error borrando usuario en auth:", deleteError)
      return { success: false, error: "No se ha podido completar el borrado de la cuenta." }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Error en confirmAccountDeletionAction:", err)
    return { success: false, error: "Ha ocurrido un error inesperado al confirmar la eliminación." }
  }
}


