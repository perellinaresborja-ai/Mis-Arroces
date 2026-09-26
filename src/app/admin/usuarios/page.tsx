import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { AdminUsuariosClient, AdminUserItem } from "./AdminUsuariosClient"

export const dynamic = "force-dynamic"

export default async function AdminUsuariosPage() {
  const adminSession = await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  // 1. Cargar perfiles, fundadores, roles y estadísticas en paralelo
  const [
    profilesRes,
    authUsersRes,
    foundersRes,
    adminRolesRes,
    recipesRes,
    postsRes,
    sessionsRes,
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, username, display_name, account_status, account_type, professional_type, created_at, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    adminClient.from("founders").select("user_id, founder_number"),
    adminClient.from("admin_roles").select("user_id, role"),
    adminClient.from("recipes").select("owner_id"),
    adminClient.from("social_posts").select("author_id"),
    adminClient.from("cooking_sessions").select("user_id"),
  ])

  const profiles = profilesRes.data || []
  const authUsers = authUsersRes.data?.users || []
  const founders = foundersRes.data || []
  const adminRoles = adminRolesRes.data || []
  const recipes = recipesRes.data || []
  const posts = postsRes.data || []
  const sessions = sessionsRes.data || []

  // Mapeos rápidos O(1)
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email || null]))
  const founderMap = new Map(founders.map((f) => [f.user_id, f.founder_number]))
  const roleMap = new Map(adminRoles.map((r) => [r.user_id, r.role as any]))

  const recipeCountMap = new Map<string, number>()
  recipes.forEach((r) => {
    if (r.owner_id) recipeCountMap.set(r.owner_id, (recipeCountMap.get(r.owner_id) || 0) + 1)
  })

  const postCountMap = new Map<string, number>()
  posts.forEach((p) => {
    if (p.author_id) postCountMap.set(p.author_id, (postCountMap.get(p.author_id) || 0) + 1)
  })

  const sessionCountMap = new Map<string, number>()
  sessions.forEach((s) => {
    if (s.user_id) sessionCountMap.set(s.user_id, (sessionCountMap.get(s.user_id) || 0) + 1)
  })

  // 2. Construcción de items de usuario completos
  const users: AdminUserItem[] = profiles.map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    email: emailMap.get(p.id) || null,
    createdAt: p.created_at,
    accountStatus: (p.account_status as any) || "ACTIVE",
    accountType: (p.account_type as any) || "PERSONAL",
    professionalType: p.professional_type || null,
    founderNumber: founderMap.get(p.id) ?? null,
    adminRole: roleMap.get(p.id) || null,
    avatarUrl: (p as any).avatar?.storage_path || null,
    recipesCount: recipeCountMap.get(p.id) || 0,
    postsCount: postCountMap.get(p.id) || 0,
    sessionsCount: sessionCountMap.get(p.id) || 0,
  }))

  return (
    <AdminUsuariosClient
      users={users}
      currentAdminRole={adminSession.role}
    />
  )
}
