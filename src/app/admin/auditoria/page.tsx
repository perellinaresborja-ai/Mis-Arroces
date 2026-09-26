import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { AdminAuditoriaClient, AuditLogItem } from "./AdminAuditoriaClient"

export const dynamic = "force-dynamic"

export default async function AdminAuditoriaPage() {
  await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  // 1. Obtener registros de auditoría recientes (últimos 150)
  const { data: logsData } = await adminClient
    .from("admin_audit_logs")
    .select("id, admin_id, action, target_type, target_id, details, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(150)

  const rawLogs = logsData || []

  // 2. Extraer admin_ids para resolver perfiles
  const adminIds = Array.from(
    new Set(rawLogs.map((l) => l.admin_id).filter((id): id is string => Boolean(id)))
  )

  let profileMap = new Map<string, any>()
  if (adminIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .in("id", adminIds)

    if (profiles) {
      profiles.forEach((p) => profileMap.set(p.id, p))
    }
  }

  // 3. Mapear a AuditLogItem
  const logs: AuditLogItem[] = rawLogs.map((l) => {
    const adminProfile = l.admin_id ? profileMap.get(l.admin_id) : null
    return {
      id: l.id,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      details: l.details,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
      admin: adminProfile
        ? {
            id: adminProfile.id,
            username: adminProfile.username,
            displayName: adminProfile.display_name,
            avatarUrl: adminProfile.avatar?.storage_path || null,
          }
        : null,
    }
  })

  return <AdminAuditoriaClient logs={logs} />
}
