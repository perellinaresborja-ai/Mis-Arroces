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

    // Check if user has already reported this exact target while pending
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

    const { data: newReport, error: insertError } = await (supabase as any)
      .from("moderation_reports")
      .insert({
        reporter_id: user.id,
        reported_user_id: input.reportedUserId || null,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason.trim(),
        details: input.details ? input.details.trim() : null,
        content_snapshot: input.contentSnapshot || null,
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
