"use server"

import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { logAdminAction } from "@/lib/admin/audit"
import { revalidatePath } from "next/cache"
import { sendPushToUser } from "@/lib/push"
import { sendFounderEmail } from "@/lib/email"
import { Resend } from "resend"

// ============================================================================
// 1. USUARIOS ACTIONS
// ============================================================================

export async function updateUserAccountStatus(
  userId: string,
  newStatus: "ACTIVE" | "SUSPENDED",
  reason?: string
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("profiles")
    .update({ account_status: newStatus })
    .eq("id", userId)

  if (error) {
    throw new Error(`Error al actualizar estado de cuenta: ${error.message}`)
  }

  await logAdminAction({
    adminId: adminSession.user.id,
    action: newStatus === "SUSPENDED" ? "USER_SUSPEND" : "USER_REACTIVATE",
    targetType: "USER",
    targetId: userId,
    details: { newStatus, reason: reason || "Acción manual del administrador" },
  })

  revalidatePath("/admin/usuarios")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateUserAccountType(
  userId: string,
  accountType: "PERSONAL" | "PROFESSIONAL",
  professionalType?: string | null
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const updatePayload: Record<string, any> = {
    account_type: accountType,
    professional_type: accountType === "PROFESSIONAL" ? (professionalType || "CHEF").toUpperCase() : null,
  }

  const { error } = await adminClient
    .from("profiles")
    .update(updatePayload as any)
    .eq("id", userId)

  if (error) {
    throw new Error(`Error al actualizar tipo de cuenta: ${error.message}`)
  }

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "USER_UPDATE_TYPE",
    targetType: "USER",
    targetId: userId,
    details: updatePayload,
  })

  revalidatePath("/admin/usuarios")
  revalidatePath("/admin")
  return { success: true }
}

export async function setUserAdminRole(
  userId: string,
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "NONE"
) {
  // Solo SUPER_ADMIN puede alterar roles de administración
  const adminSession = await requireAdminSession("SUPER_ADMIN")
  const adminClient = getAdminClient()

  if (role === "NONE") {
    const { error } = await adminClient
      .from("admin_roles")
      .delete()
      .eq("user_id", userId)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await adminClient
      .from("admin_roles")
      .upsert({
        user_id: userId,
        role,
        created_by: adminSession.user.id,
      })

    if (error) throw new Error(error.message)
  }

  await logAdminAction({
    adminId: adminSession.user.id,
    action: role === "NONE" ? "ADMIN_ROLE_REVOKE" : "ADMIN_ROLE_ASSIGN",
    targetType: "USER",
    targetId: userId,
    details: { assignedRole: role },
  })

  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/auditoria")
  return { success: true }
}

// ============================================================================
// 2. MODERACIÓN ACTIONS
// ============================================================================

export async function reviewModerationReport(reportId: string) {
  const adminSession = await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("moderation_reports")
    .update({
      status: "REVIEWED",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminSession.user.id,
    })
    .eq("id", reportId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "MODERATION_REPORT_REVIEWED",
    targetType: "REPORT",
    targetId: reportId,
  })

  revalidatePath("/admin/moderacion")
  revalidatePath("/admin")
  return { success: true }
}

export async function dismissModerationReport(reportId: string, notes?: string) {
  const adminSession = await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("moderation_reports")
    .update({
      status: "DISMISSED",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminSession.user.id,
    })
    .eq("id", reportId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "MODERATION_REPORT_DISMISSED",
    targetType: "REPORT",
    targetId: reportId,
    details: { notes },
  })

  revalidatePath("/admin/moderacion")
  revalidatePath("/admin")
  return { success: true }
}

export async function actionModerationReport(
  reportId: string,
  actionType: "HIDE_CONTENT" | "SUSPEND_USER" | "WARN_USER",
  targetType: string,
  targetId: string,
  notes?: string
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  // 1. Ejecutar medida según objetivo
  if (actionType === "HIDE_CONTENT") {
    if (targetType === "RECIPE") {
      await adminClient.from("recipes").update({ status: "DRAFT" }).eq("id", targetId)
    } else if (targetType === "POST") {
      await adminClient.from("social_posts").update({ status: "DRAFT" }).eq("id", targetId)
    } else if (targetType === "STORY") {
      await adminClient.from("stories").update({ expires_at: new Date().toISOString() }).eq("id", targetId)
    }
  } else if (actionType === "SUSPEND_USER") {
    await adminClient.from("profiles").update({ account_status: "SUSPENDED" }).eq("id", targetId)
  }

  // 2. Marcar reporte como ACTIONED
  const { error } = await adminClient
    .from("moderation_reports")
    .update({
      status: "ACTIONED",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminSession.user.id,
    })
    .eq("id", reportId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "MODERATION_REPORT_ACTIONED",
    targetType: "REPORT",
    targetId: reportId,
    details: { actionType, targetType, targetId, notes },
  })

  revalidatePath("/admin/moderacion")
  revalidatePath("/admin/contenidos")
  revalidatePath("/admin")
  return { success: true }
}

// ============================================================================
// 3. CONTENIDOS ACTIONS
// ============================================================================

export async function toggleRecipeStatusAdmin(
  recipeId: string,
  newStatus: "PUBLISHED" | "DRAFT"
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("recipes")
    .update({ status: newStatus })
    .eq("id", recipeId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: newStatus === "PUBLISHED" ? "RECIPE_PUBLISH" : "RECIPE_UNPUBLISH",
    targetType: "RECIPE",
    targetId: recipeId,
    details: { newStatus },
  })

  revalidatePath("/admin/contenidos")
  revalidatePath(`/recipes/${recipeId}`)
  return { success: true }
}

export async function togglePostOptionsAdmin(
  postId: string,
  field: "allow_comments" | "is_pinned" | "hide",
  value: boolean
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  if (field === "hide") {
    const { error } = await adminClient
      .from("social_posts")
      .update({ status: value ? "DRAFT" : "PUBLISHED" })
      .eq("id", postId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await adminClient
      .from("social_posts")
      .update({ [field]: value } as any)
      .eq("id", postId)
    if (error) throw new Error(error.message)
  }

  await logAdminAction({
    adminId: adminSession.user.id,
    action: `POST_${field.toUpperCase()}`,
    targetType: "POST",
    targetId: postId,
    details: { [field]: value },
  })

  revalidatePath("/admin/contenidos")
  return { success: true }
}

export async function expireStoryAdmin(storyId: string) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("stories")
    .update({ expires_at: new Date().toISOString() })
    .eq("id", storyId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "STORY_EXPIRE",
    targetType: "STORY",
    targetId: storyId,
  })

  revalidatePath("/admin/contenidos")
  return { success: true }
}

export async function toggleMusicTrackActive(trackId: string, active: boolean) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from("story_music_tracks")
    .update({ active })
    .eq("id", trackId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: active ? "MUSIC_TRACK_ACTIVATE" : "MUSIC_TRACK_DEACTIVATE",
    targetType: "MUSIC",
    targetId: trackId,
    details: { active },
  })

  revalidatePath("/admin/contenidos/musica")
  return { success: true }
}

// ============================================================================
// 4. FUNDADORES ACTIONS
// ============================================================================

export async function resendFounderWelcomeEmailAdmin(founderNumber: number) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  // Buscar fundador y su perfil
  const { data: founder, error: founderErr } = await adminClient
    .from("founders")
    .select("user_id, founder_number")
    .eq("founder_number", founderNumber)
    .single()

  if (founderErr || !founder) {
    throw new Error(`Plaza fundadora #${founderNumber} no encontrada`)
  }

  // Buscar usuario y email
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", founder.user_id)
    .single()

  const { data: authUser } = await adminClient.auth.admin.getUserById(founder.user_id)
  const targetEmail = authUser?.user?.email

  if (!targetEmail) {
    throw new Error(`Email no encontrado en Auth para el usuario #${founderNumber}`)
  }

  // Enviar email oficial con Resend
  const emailResult = await sendFounderEmail(targetEmail, founderNumber, {
    displayName: profile?.display_name || undefined,
    username: profile?.username || undefined,
    publicCode: profile?.username || undefined,
  })

  if (emailResult.error) {
    throw new Error(`Error enviando email vía Resend: ${JSON.stringify(emailResult.error)}`)
  }

  // Registrar timestamp oficial
  await adminClient
    .from("founders")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("founder_number", founderNumber)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: "FOUNDER_WELCOME_RESENT",
    targetType: "FOUNDER",
    targetId: String(founderNumber),
    details: { email: targetEmail, userId: founder.user_id },
  })

  revalidatePath("/admin/fundadores")
  revalidatePath("/admin")
  return { success: true }
}

// ============================================================================
// 5. INCIDENCIAS ACTIONS
// ============================================================================

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: "OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED"
) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  const updateData: Record<string, any> = { status: newStatus }
  if (newStatus === "RESOLVED") {
    updateData.resolved_at = new Date().toISOString()
    updateData.resolved_by = adminSession.user.id
  }

  const { error } = await adminClient
    .from("app_incidents")
    .update(updateData as any)
    .eq("id", incidentId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    adminId: adminSession.user.id,
    action: `INCIDENT_${newStatus}`,
    targetType: "INCIDENT",
    targetId: incidentId,
    details: { newStatus },
  })

  revalidatePath("/admin/incidencias")
  revalidatePath("/admin")
  return { success: true }
}

// ============================================================================
// 6. COMUNICACIONES & CAMPAÑAS
// ============================================================================

export interface AudienceFilters {
  segment:
    | "ALL"
    | "FOUNDERS"
    | "NON_FOUNDERS"
    | "PROFESSIONALS"
    | "PERSONAL"
    | "CHEF"
    | "RESTAURANT"
    | "CREATOR"
    | "BRAND"
    | "PRODUCER"
    | "OTHER"
    | "ACTIVE_30D"
    | "INACTIVE"
    | "MANUAL"
  manualUserIds?: string[]
}

export async function resolveTargetAudience(filters: AudienceFilters) {
  const adminClient = getAdminClient()

  // 1. Manual
  if (filters.segment === "MANUAL" && filters.manualUserIds && filters.manualUserIds.length > 0) {
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .in("id", filters.manualUserIds)
    return data || []
  }

  // 2. Por Fundadores
  if (filters.segment === "FOUNDERS") {
    const { data: founders } = await adminClient.from("founders").select("user_id")
    const founderUserIds = (founders || []).map((f) => f.user_id)
    if (founderUserIds.length === 0) return []
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .in("id", founderUserIds)
    return data || []
  }

  if (filters.segment === "NON_FOUNDERS") {
    const { data: founders } = await adminClient.from("founders").select("user_id")
    const founderUserIds = (founders || []).map((f) => f.user_id)
    let q = adminClient.from("profiles").select("id, username, display_name")
    if (founderUserIds.length > 0) {
      q = q.not("id", "in", `(${founderUserIds.join(",")})`)
    }
    const { data } = await q
    return data || []
  }

  // 3. Profesionales o por sector
  const profSectors = ["CHEF", "RESTAURANT", "CREATOR", "BRAND", "PRODUCER", "OTHER"]
  if (profSectors.includes(filters.segment)) {
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .eq("account_type", "PROFESSIONAL")
      .eq("professional_type", filters.segment as any)
    return data || []
  }

  if (filters.segment === "PROFESSIONALS") {
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .eq("account_type", "PROFESSIONAL")
    return data || []
  }

  if (filters.segment === "PERSONAL") {
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .or("account_type.is.null,account_type.eq.PERSONAL")
    return data || []
  }

  // 4. Activos 30d
  if (filters.segment === "ACTIVE_30D") {
    const d30Iso = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data: activeEvents } = await adminClient
      .from("analytics_events")
      .select("actor_id")
      .gte("created_at", d30Iso)
    const activeActorIds: string[] = Array.from(
      new Set(
        (activeEvents || [])
          .map((e) => e.actor_id)
          .filter((id): id is string => Boolean(id))
      )
    )
    if (activeActorIds.length === 0) return []
    const { data } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .in("id", activeActorIds)
    return data || []
  }

  if (filters.segment === "INACTIVE") {
    const d30Iso = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data: activeEvents } = await adminClient
      .from("analytics_events")
      .select("actor_id")
      .gte("created_at", d30Iso)
    const activeActorIds: string[] = Array.from(
      new Set(
        (activeEvents || [])
          .map((e) => e.actor_id)
          .filter((id): id is string => Boolean(id))
      )
    )
    let q = adminClient.from("profiles").select("id, username, display_name")
    if (activeActorIds.length > 0) {
      q = q.not("id", "in", `(${activeActorIds.join(",")})`)
    }
    const { data } = await q
    return data || []
  }

  // 5. Todos (ALL)
  const { data } = await adminClient.from("profiles").select("id, username, display_name")
  return data || []
}

export async function getAudienceCount(filters: AudienceFilters) {
  await requireAdminSession("ADMIN")
  const audience = await resolveTargetAudience(filters)
  return audience.length
}

export interface SendCampaignInput {
  channels: ("IN_APP" | "PUSH" | "EMAIL")[]
  filters: AudienceFilters
  title: string
  message: string
  subject?: string
  ctaText?: string
  ctaUrl?: string
}

export async function sendAdminCampaign(input: SendCampaignInput) {
  const adminSession = await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  if (!input.channels || input.channels.length === 0) {
    throw new Error("Debes seleccionar al menos un canal de comunicación.")
  }

  if (!input.title || !input.message) {
    throw new Error("Título y mensaje son campos obligatorios.")
  }

  const audience = await resolveTargetAudience(input.filters)
  const recipientCount = audience.length

  if (recipientCount === 0) {
    throw new Error("El segmento seleccionado no contiene ningún usuario destinatario.")
  }

  let sentCount = 0
  let failedCount = 0
  const errors: string[] = []

  // Preparamos clientes externos si se incluye EMAIL
  let resendClient: Resend | null = null
  if (input.channels.includes("EMAIL")) {
    if (process.env.RESEND_API_KEY) {
      resendClient = new Resend(process.env.RESEND_API_KEY)
    } else {
      errors.push("RESEND_API_KEY no configurada en el servidor para envío de emails.")
    }
  }

  // 1. Obtener emails si se requiere canal EMAIL
  let userEmailMap = new Map<string, string>()
  if (input.channels.includes("EMAIL")) {
    try {
      const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      if (authData?.users) {
        authData.users.forEach((u) => {
          if (u.email) userEmailMap.set(u.id, u.email)
        })
      }
    } catch (e: any) {
      console.warn("[Admin Campaign] Could not map user emails:", e.message)
    }
  }

  // 2. Envío a cada destinatario de la audiencia
  for (const user of audience) {
    try {
      // Canal A: In-App notification (tabla notifications)
      if (input.channels.includes("IN_APP")) {
        await adminClient.from("notifications").insert({
          recipient_id: user.id,
          actor_id: adminSession.user.id,
          type: "SYSTEM",
          entity_type: "announcement",
          entity_id: adminSession.user.id,
          payload: {
            title: input.title,
            body: input.message,
            url: input.ctaUrl || "/",
            subtype: "ADMIN_ANNOUNCEMENT",
          },
        })
      }

      // Canal B: Web Push
      if (input.channels.includes("PUSH")) {
        try {
          await sendPushToUser(user.id, {
            title: input.title,
            body: input.message,
            url: input.ctaUrl || "/",
            tag: `campaign-${Date.now()}`,
          })
        } catch (_) {}
      }

      // Canal C: Email vía Resend
      if (input.channels.includes("EMAIL") && resendClient) {
        const targetEmail = userEmailMap.get(user.id)
        if (targetEmail) {
          try {
            await resendClient.emails.send({
              from: "misarroces <info@misarroces.es>",
              to: targetEmail,
              subject: input.subject || input.title,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 32px 24px; border-radius: 20px; border: 1px solid #eaeaea;">
                  <img src="https://www.misarroces.es/logover.png" alt="misarroces" width="140" style="display: block; margin: 0 auto 24px;" />
                  <h2 style="color: #18181b; font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 16px;">${input.title}</h2>
                  <div style="color: #52525b; font-size: 14px; line-height: 24px; margin-bottom: 24px;">${input.message.replace(/\n/g, "<br/>")}</div>
                  ${
                    input.ctaUrl && input.ctaText
                      ? `<div style="text-align: center; margin: 28px 0;"><a href="${input.ctaUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block;">${input.ctaText}</a></div>`
                      : ""
                  }
                  <div style="border-top: 1px solid #f4f4f5; padding-top: 16px; text-align: center; color: #a1a1aa; font-size: 11px;">
                    © 2026 misarroces.es · Comunicación oficial
                  </div>
                </div>
              `,
            })
          } catch (mailErr: any) {
            console.warn(`[Campaign Email Error] to ${targetEmail}:`, mailErr.message)
          }
        }
      }

      sentCount++
    } catch (sendErr: any) {
      failedCount++
      errors.push(sendErr.message || String(sendErr))
    }
  }

  // 3. Persistir en admin_campaigns si la tabla existe, o fall back limpio
  try {
    await adminClient.from("admin_campaigns").insert({
      admin_id: adminSession.user.id,
      title: input.title,
      message: input.message,
      subject: input.subject || null,
      cta_url: input.ctaUrl || null,
      cta_text: input.ctaText || null,
      channels: input.channels,
      segment: input.filters.segment,
      recipient_count: recipientCount,
      sent_count: sentCount,
      failed_count: failedCount,
      status: failedCount === recipientCount ? "FAILED" : "COMPLETED",
      error_details: errors.length > 0 ? { errors: errors.slice(0, 5) } : null,
    })
  } catch (campErr) {
    console.warn("[Admin Campaign] admin_campaigns table not yet created, logged to audit.")
  }

  // 4. Registro inmutable en auditoría
  await logAdminAction({
    adminId: adminSession.user.id,
    action: "CAMPAIGN_SENT",
    targetType: "COMMUNICATION",
    details: {
      channels: input.channels,
      segment: input.filters.segment,
      recipientCount,
      sentCount,
      failedCount,
      title: input.title,
    },
  })

  revalidatePath("/admin/comunicaciones")
  revalidatePath("/admin/auditoria")

  return {
    success: true,
    recipientCount,
    sentCount,
    failedCount,
  }
}
