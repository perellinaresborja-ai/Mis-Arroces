import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { AdminModeracionClient, ModerationReportItem } from "./AdminModeracionClient"

export const dynamic = "force-dynamic"

export default async function AdminModeracionPage() {
  const adminSession = await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  // 1. Obtener reportes
  const { data: reportsData } = await adminClient
    .from("moderation_reports")
    .select(`
      id, target_type, target_id, reporter_id, reported_user_id,
      reason, details, content_snapshot, status, created_at, reviewed_at
    `)
    .order("created_at", { ascending: false })

  const rawReports = reportsData || []

  // 2. Extraer IDs de usuarios para traer sus perfiles en lote
  const userIds = Array.from(
    new Set(
      rawReports
        .flatMap((r) => [r.reporter_id, r.reported_user_id])
        .filter((id): id is string => Boolean(id))
    )
  )

  let profileMap = new Map<string, any>()
  if (userIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .in("id", userIds)

    if (profiles) {
      profiles.forEach((p) => profileMap.set(p.id, p))
    }
  }

  // 3. Mapear a ModerationReportItem
  const reports: ModerationReportItem[] = rawReports.map((r) => {
    const reporterProfile = r.reporter_id ? profileMap.get(r.reporter_id) : null
    const reportedProfile = r.reported_user_id ? profileMap.get(r.reported_user_id) : null

    return {
      id: r.id,
      targetType: r.target_type,
      targetId: r.target_id,
      reason: r.reason,
      details: r.details,
      contentSnapshot: r.content_snapshot,
      status: r.status as any,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
      reporter: reporterProfile
        ? {
            id: reporterProfile.id,
            username: reporterProfile.username,
            displayName: reporterProfile.display_name,
            avatarUrl: reporterProfile.avatar?.storage_path || null,
          }
        : null,
      reportedUser: reportedProfile
        ? {
            id: reportedProfile.id,
            username: reportedProfile.username,
            displayName: reportedProfile.display_name,
            avatarUrl: reportedProfile.avatar?.storage_path || null,
          }
        : null,
    }
  })

  return (
    <AdminModeracionClient
      reports={reports}
      currentAdminRole={adminSession.role}
    />
  )
}
