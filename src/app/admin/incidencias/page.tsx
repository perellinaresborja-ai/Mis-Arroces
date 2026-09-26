import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { AdminIncidenciasClient, IncidentItem } from "./AdminIncidenciasClient"

export const dynamic = "force-dynamic"

export default async function AdminIncidenciasPage() {
  await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  // Cargar incidencias reales de la tabla app_incidents
  const { data: rawIncidents } = await adminClient
    .from("app_incidents")
    .select(`
      id, incident_type, message, stack, url, user_agent, user_id,
      context, status, created_at, resolved_at, resolved_by
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const incidentsList = rawIncidents || []

  // Extraer IDs de usuarios afectados para traer sus perfiles
  const userIds = Array.from(
    new Set(incidentsList.map((i) => i.user_id).filter((id): id is string => Boolean(id)))
  )
  let profileMap = new Map<string, any>()

  if (userIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, display_name")
      .in("id", userIds)

    if (profiles) {
      profiles.forEach((p) => profileMap.set(p.id, p))
    }
  }

  const incidents: IncidentItem[] = incidentsList.map((i) => {
    const prof = i.user_id ? profileMap.get(i.user_id) : null
    return {
      id: i.id,
      incidentType: i.incident_type || "CLIENT_ERROR",
      message: i.message,
      stack: i.stack,
      url: i.url,
      userAgent: i.user_agent,
      userId: i.user_id,
      context: i.context,
      status: (i.status as any) || "OPEN",
      createdAt: i.created_at,
      resolvedAt: i.resolved_at,
      resolvedByUsername: null,
      user: prof
        ? {
            username: prof.username,
            displayName: prof.display_name,
          }
        : null,
    }
  })

  return <AdminIncidenciasClient incidents={incidents} />
}
