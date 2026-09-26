import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import {
  AdminFundadoresClient,
  FounderListItem,
} from "./AdminFundadoresClient"

export const dynamic = "force-dynamic"

export default async function AdminFundadoresPage() {
  await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  // 1. Cargar las plazas fundadoras asignadas
  const [foundersRes, authUsersRes] = await Promise.all([
    adminClient
      .from("founders")
      .select("founder_number, user_id, granted_at, welcome_email_sent_at")
      .order("founder_number", { ascending: true }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const rawFounders = foundersRes.data || []
  const authUsers = authUsersRes.data?.users || []
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email || null]))

  // 2. Extraer user_ids para obtener sus perfiles
  const userIds = rawFounders.map((f) => f.user_id).filter(Boolean)
  let profileMap = new Map<string, any>()

  if (userIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, display_name, account_status, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .in("id", userIds)

    if (profiles) {
      profiles.forEach((p) => profileMap.set(p.id, p))
    }
  }

  // 3. Mapear a FounderListItem
  const founders: FounderListItem[] = rawFounders.map((f) => {
    const prof = profileMap.get(f.user_id)
    return {
      founderNumber: f.founder_number,
      userId: f.user_id,
      grantedAt: f.granted_at,
      welcomeEmailSentAt: f.welcome_email_sent_at,
      user: prof
        ? {
            username: prof.username,
            displayName: prof.display_name,
            email: emailMap.get(f.user_id) || null,
            accountStatus: prof.account_status || "ACTIVE",
            avatarUrl: prof.avatar?.storage_path || null,
          }
        : null,
    }
  })

  return <AdminFundadoresClient founders={founders} totalSpots={100} />
}
