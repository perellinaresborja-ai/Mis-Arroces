import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import {
  AdminComunicacionesClient,
  CampaignHistoryItem,
} from "./AdminComunicacionesClient"

export const dynamic = "force-dynamic"

export default async function AdminComunicacionesPage() {
  await requireAdminSession("ADMIN")
  const adminClient = getAdminClient()

  // 1. Cargar historial de campañas (de admin_campaigns si existe, o de auditoría como fallback)
  let initialCampaigns: CampaignHistoryItem[] = []
  try {
    const { data: campData } = await adminClient
      .from("admin_campaigns")
      .select("id, title, message, channels, segment, recipient_count, sent_count, failed_count, created_at, admin_id")
      .order("created_at", { ascending: false })
      .limit(30)

    if (campData && campData.length > 0) {
      const adminIds = Array.from(new Set(campData.map((c) => c.admin_id).filter((id): id is string => Boolean(id))))
      let adminMap = new Map<string, string>()
      if (adminIds.length > 0) {
        const { data: admins } = await adminClient.from("profiles").select("id, username").in("id", adminIds)
        if (admins) {
          admins.forEach((a) => adminMap.set(a.id, a.username))
        }
      }

      initialCampaigns = campData.map((c) => ({
        id: c.id,
        title: c.title,
        message: c.message,
        channels: (c.channels as any) || [],
        segment: c.segment || "ALL",
        recipientCount: c.recipient_count || 0,
        sentCount: c.sent_count || 0,
        failedCount: c.failed_count || 0,
        createdAt: c.created_at,
        adminUsername: c.admin_id ? (adminMap.get(c.admin_id) || "admin") : "admin",
      }))
    }
  } catch (_) {
    // Si la tabla aún no se ha ejecutado, inicializa vacío
    initialCampaigns = []
  }

  // 2. Cargar lista de perfiles para selección manual
  const { data: usersData } = await adminClient
    .from("profiles")
    .select("id, username, display_name")
    .order("username", { ascending: true })

  const allUsersList = (usersData || []).map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.display_name,
  }))

  return (
    <AdminComunicacionesClient
      initialCampaigns={initialCampaigns}
      allUsersList={allUsersList}
    />
  )
}
