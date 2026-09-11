"use server"

import { createClient } from "@/lib/supabase/server"

export type ModerationTargetType = 
  | "POST"
  | "COMMENT"
  | "COMMENT_REPLY"
  | "RECIPE"
  | "STORY"
  | "USER"
  | "MESSAGE"

export type ModerationStatus = "PENDING" | "REVIEWED" | "ACTIONED" | "DISMISSED"

export const MODERATION_REASONS = [
  "Spam",
  "Acoso o comportamiento ofensivo",
  "Contenido inapropiado",
  "Información falsa o engañosa",
  "Suplantación de identidad",
  "Infracción de derechos",
  "Otro"
] as const

export type ModerationReason = typeof MODERATION_REASONS[number]

export interface CreateModerationReportInput {
  targetType: ModerationTargetType
  targetId: string
  reportedUserId?: string | null
  reason: string
  details?: string | null
  contentSnapshot?: Record<string, any> | null
}

export interface ModerationReportResult {
  success: boolean
  message: string
  alreadyReported?: boolean
  reportId?: string
}

/**
 * Validates target existence, verifies actual owner server-side,
 * rejects self-reporting, and builds a strictly minimized snapshot.
 */
async function resolveAndValidateTarget(
  supabase: any,
  currentUserId: string,
  targetType: ModerationTargetType,
  targetId: string
): Promise<{
  isValid: boolean
  ownerId: string | null
  minimalSnapshot: Record<string, any>
  error?: string
}> {
  switch (targetType) {
    case "POST": {
      const { data: post, error } = await supabase
        .from("social_posts")
        .select("id, author_id, content, created_at")
        .eq("id", targetId)
        .maybeSingle()

      if (error || !post) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "La publicación no existe o ya no está disponible." }
      }
      if (post.author_id === currentUserId) {
        return { isValid: false, ownerId: post.author_id, minimalSnapshot: {}, error: "No puedes reportar tu propio contenido." }
      }

      return {
        isValid: true,
        ownerId: post.author_id,
        minimalSnapshot: {
          target_type: "POST",
          post_id: post.id,
          author_id: post.author_id,
          text_snippet: typeof post.content === "string" ? post.content.slice(0, 300) : null,
          created_at: post.created_at
        }
      }
    }

    case "COMMENT":
    case "COMMENT_REPLY": {
      // Could be post_comments or recipe_comments
      const { data: postComment } = await supabase
        .from("post_comments")
        .select("id, author_id, content, parent_id, created_at")
        .eq("id", targetId)
        .maybeSingle()

      let comment = postComment
      let commentSource = "post"

      if (!comment) {
        const { data: recipeComment } = await supabase
          .from("recipe_comments")
          .select("id, author_id, content, parent_id, created_at")
          .eq("id", targetId)
          .maybeSingle()

        if (recipeComment) {
          comment = recipeComment
          commentSource = "recipe"
        }
      }

      if (!comment) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "El comentario no existe o ya no está disponible." }
      }
      if (comment.author_id === currentUserId) {
        return { isValid: false, ownerId: comment.author_id, minimalSnapshot: {}, error: "No puedes reportar tu propio contenido." }
      }

      return {
        isValid: true,
        ownerId: comment.author_id,
        minimalSnapshot: {
          target_type: targetType,
          comment_id: comment.id,
          source: commentSource,
          author_id: comment.author_id,
          text_snippet: typeof comment.content === "string" ? comment.content.slice(0, 300) : null,
          parent_id: comment.parent_id || null,
          created_at: comment.created_at
        }
      }
    }

    case "RECIPE": {
      const { data: recipe, error } = await supabase
        .from("recipes")
        .select("id, owner_id, name, created_at")
        .eq("id", targetId)
        .maybeSingle()

      if (error || !recipe) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "La receta no existe o ya no está disponible." }
      }
      if (recipe.owner_id === currentUserId) {
        return { isValid: false, ownerId: recipe.owner_id, minimalSnapshot: {}, error: "No puedes reportar tu propio contenido." }
      }

      return {
        isValid: true,
        ownerId: recipe.owner_id,
        minimalSnapshot: {
          target_type: "RECIPE",
          recipe_id: recipe.id,
          owner_id: recipe.owner_id,
          name: typeof recipe.name === "string" ? recipe.name.slice(0, 100) : null,
          created_at: recipe.created_at
        }
      }
    }

    case "STORY": {
      const { data: story, error } = await supabase
        .from("stories")
        .select("id, owner_id, caption, created_at")
        .eq("id", targetId)
        .maybeSingle()

      if (error || !story) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "La historia no existe o ya no está disponible." }
      }
      if (story.owner_id === currentUserId) {
        return { isValid: false, ownerId: story.owner_id, minimalSnapshot: {}, error: "No puedes reportar tu propio contenido." }
      }

      // No raw media or base64
      return {
        isValid: true,
        ownerId: story.owner_id,
        minimalSnapshot: {
          target_type: "STORY",
          story_id: story.id,
          owner_id: story.owner_id,
          caption_snippet: typeof story.caption === "string" ? story.caption.slice(0, 300) : null,
          created_at: story.created_at
        }
      }
    }

    case "USER": {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("id", targetId)
        .maybeSingle()

      if (error || !profile) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "El usuario no existe." }
      }
      if (profile.id === currentUserId) {
        return { isValid: false, ownerId: profile.id, minimalSnapshot: {}, error: "No puedes reportarte a ti mismo." }
      }

      // Never include private settings or sensitive info
      return {
        isValid: true,
        ownerId: profile.id,
        minimalSnapshot: {
          target_type: "USER",
          user_id: profile.id,
          username: profile.username,
          display_name: profile.display_name
        }
      }
    }

    case "MESSAGE": {
      const { data: message, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, type, created_at")
        .eq("id", targetId)
        .maybeSingle()

      if (error || !message) {
        return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "El mensaje no existe o ya no está disponible." }
      }
      if (message.sender_id === currentUserId) {
        return { isValid: false, ownerId: message.sender_id, minimalSnapshot: {}, error: "No puedes reportar tu propio mensaje." }
      }

      // Strictly isolated to this single message snippet, no full conversation history
      return {
        isValid: true,
        ownerId: message.sender_id,
        minimalSnapshot: {
          target_type: "MESSAGE",
          message_id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          message_type: message.type,
          text_snippet: typeof message.body === "string" ? message.body.slice(0, 300) : null,
          created_at: message.created_at
        }
      }
    }

    default:
      return { isValid: false, ownerId: null, minimalSnapshot: {}, error: "Tipo de contenido desconocido." }
  }
}

export async function createModerationReport(
  input: CreateModerationReportInput
): Promise<ModerationReportResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Debes iniciar sesión para reportar contenido."
      }
    }

    if (!input.targetId || !input.targetType) {
      return {
        success: false,
        message: "Datos de reporte inválidos."
      }
    }

    if (!input.reason || typeof input.reason !== "string" || !input.reason.trim()) {
      return {
        success: false,
        message: "Debes seleccionar un motivo para el reporte."
      }
    }

    // Check if user has already reported this exact target while pending (Anti-Spam)
    const { data: existingReport } = await (supabase as any)
      .from("moderation_reports")
      .select("id, status")
      .eq("reporter_id", user.id)
      .eq("target_type", input.targetType)
      .eq("target_id", input.targetId)
      .eq("status", "PENDING")
      .maybeSingle()

    if (existingReport) {
      return {
        success: true,
        alreadyReported: true,
        reportId: existingReport.id,
        message: "Ya has enviado un reporte para este contenido. Lo estamos revisando."
      }
    }

    // Server-side validation of target existence, self-reporting prevention, and verified owner
    const validation = await resolveAndValidateTarget(
      supabase,
      user.id,
      input.targetType,
      input.targetId
    )

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "No se puede reportar este contenido."
      }
    }

    const { data: newReport, error: insertError } = await (supabase as any)
      .from("moderation_reports")
      .insert({
        reporter_id: user.id,
        reported_user_id: validation.ownerId,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason.trim(),
        details: input.details ? input.details.trim().slice(0, 1000) : null,
        content_snapshot: validation.minimalSnapshot,
        status: "PENDING"
      })
      .select("id")
      .single()

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          success: true,
          alreadyReported: true,
          message: "Ya has enviado un reporte para este contenido. Lo estamos revisando."
        }
      }

      console.error("Error creating moderation report:", insertError)
      return {
        success: false,
        message: "No se pudo registrar el reporte. Por favor, inténtalo más tarde."
      }
    }

    return {
      success: true,
      reportId: newReport?.id,
      message: "Gracias. Revisaremos este contenido."
    }
  } catch (error: any) {
    console.error("Unexpected error in createModerationReport:", error)
    return {
      success: false,
      message: error?.message || "Ocurrió un error inesperado."
    }
  }
}

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error("Faltan credenciales de administración del servidor.")
  }
  return createSupabaseAdmin(supabaseUrl, supabaseServiceRole)
}

/**
 * Server-side check for moderator privileges.
 * Relies strictly on the server-only environment variable ADMIN_USER_IDS.
 * Note: Neither profiles nor any public table contains an 'ADMIN' role column.
 */
async function isUserAuthorizedModerator(userId: string): Promise<boolean> {
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  return adminIds.includes(userId)
}

export interface ModerationReportItem {
  id: string
  reporter_id: string | null
  reported_user_id: string | null
  target_type: ModerationTargetType
  target_id: string
  reason: string
  details: string | null
  content_snapshot: Record<string, any> | null
  status: ModerationStatus
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

/**
 * Internal Review mechanism: List moderation reports by status.
 * Strictly protected on server by moderator authorization check.
 * Uses admin client server-side to read across RLS policies after verifying user identity.
 */
export async function getModerationReports(filter?: {
  status?: ModerationStatus
  limit?: number
}): Promise<{ success: boolean; data?: ModerationReportItem[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "No autenticado." }
    }

    const isAuthorized = await isUserAuthorizedModerator(user.id)
    if (!isAuthorized) {
      return { success: false, error: "No tienes permisos de moderación." }
    }

    const adminClient = getAdminClient()
    let query = (adminClient as any)
      .from("moderation_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (filter?.status) {
      query = query.eq("status", filter.status)
    }

    if (filter?.limit) {
      query = query.limit(filter.limit)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ModerationReportItem[] }
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al obtener reportes." }
  }
}

/**
 * Internal Review mechanism: Review and update report status.
 * Contract statuses: PENDING | REVIEWED | ACTIONED | DISMISSED.
 * Strictly verifies moderator authorization and updates reviewed_at and reviewed_by.
 */
export async function reviewModerationReport(params: {
  reportId: string
  newStatus: ModerationStatus
  notes?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { reportId, newStatus } = params

    if (!["PENDING", "REVIEWED", "ACTIONED", "DISMISSED"].includes(newStatus)) {
      return { success: false, error: "Estado de moderación inválido." }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "No autenticado." }
    }

    const isAuthorized = await isUserAuthorizedModerator(user.id)
    if (!isAuthorized) {
      return { success: false, error: "No tienes permisos de moderación." }
    }

    const updatePayload: Record<string, any> = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    }

    const adminClient = getAdminClient()
    const { error } = await (adminClient as any)
      .from("moderation_reports")
      .update(updatePayload)
      .eq("id", reportId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al revisar reporte." }
  }
}
