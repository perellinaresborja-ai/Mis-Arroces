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
