import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !adminKey) {
    throw new Error("[Admin Dashboard] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createAdminClient<Database>(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export interface GrowthPoint {
  date: string // YYYY-MM-DD
  label: string // "24 Sep"
  count: number
  cumulative: number
}

export interface TopRecipeItem {
  id: string
  name: string
  authorName: string
  authorUsername: string
  count: number
}

export interface AuditLogDisplayItem {
  id: string
  actionLabel: string
  targetType: string | null
  targetId: string | null
  createdAt: string
  adminUsername: string
  relativeTime: string
}

export interface DashboardData {
  metrics: {
    totalUsers: number
    newUsers7d: number
    newUsers30d: number
    publishedRecipes: number
    totalPosts: number
    activeStories: number
    totalSessions: number
    activeUsers7d: number
    activeUsers30d: number
    eventsToday: number
    events7d: number
    pendingReports: number
    openIncidents: number
  }
  growth: {
    d7: GrowthPoint[]
    d30: GrowthPoint[]
    d90: GrowthPoint[]
  }
  community: {
    foundersAssigned: number
    foundersPendingEmail: number
    professionalTotal: number
    professionalBreakdown: Record<string, number>
  }
  topContent: {
    mostViewed: TopRecipeItem[]
    mostCooked: TopRecipeItem[]
    mostSaved: TopRecipeItem[]
  }
  recentAudit: AuditLogDisplayItem[]
  alerts: {
    pendingReports: number
    openIncidents: number
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return "hace unos segundos"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `hace ${diffMin} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "ayer"
    return `hace ${diffDays} días`
  } catch {
    return dateStr
  }
}

function formatActionLabel(action: string): string {
  switch (action) {
    case "MODERATION_REPORT_REVIEWED":
      return "Moderación · Reporte marcado como revisado"
    case "MODERATION_REPORT_ACTIONED":
      return "Moderación · Medida correctiva aplicada a reporte"
    case "MODERATION_REPORT_DISMISSED":
      return "Moderación · Reporte desestimado"
    case "FOUNDER_SPOT_ASSIGNED":
      return "Fundadores · Plaza de fundador asignada"
    case "FOUNDER_WELCOME_RESENT":
      return "Fundadores · Email de bienvenida reenviado"
    case "CONTENT_HIDE":
      return "Contenido · Publicación o receta ocultada"
    case "USER_SUSPEND":
      return "Usuarios · Cuenta suspendida"
    default:
      return action.replace(/_/g, " ").toLowerCase()
  }
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const sb = getAdminClient()

  const now = new Date()
  const d7Iso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const d30Iso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const d90Iso = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const todayStartIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Ejecución concurrente y aislada de consultas con Promise.allSettled
  const results = await Promise.allSettled([
    // 0. Profiles (total, created_at, account_type, professional_type)
    sb.from("profiles").select("id, created_at, account_type, professional_type"),
    // 1. Published recipes
    sb.from("recipes").select("id, name, owner_id, profiles:owner_id(username, display_name)").eq("status", "PUBLISHED"),
    // 2. Posts count
    sb.from("social_posts").select("id", { count: "exact", head: true }),
    // 3. Cooking sessions count
    sb.from("cooking_sessions").select("id, recipe_id"),
    // 4. Active stories
    sb.from("stories").select("id", { count: "exact", head: true }).gt("expires_at", now.toISOString()),
    // 5. Founders
    sb.from("founders").select("founder_number, welcome_email_sent_at"),
    // 6. Pending reports
    sb.from("moderation_reports").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    // 7. Open incidents
    (sb as any).from("app_incidents").select("id", { count: "exact", head: true }).in("status", ["OPEN", "INVESTIGATING"]),
    // 8. Analytics Events Today
    sb.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", todayStartIso),
    // 9. Analytics Events 7d
    sb.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", d7Iso),
    // 10. Analytics Active Users 7d
    sb.from("analytics_events").select("actor_id, visitor_id").gte("created_at", d7Iso),
    // 11. Analytics Active Users 30d
    sb.from("analytics_events").select("actor_id, visitor_id").gte("created_at", d30Iso),
    // 12. Recipe Views from Analytics
    sb.from("analytics_events").select("entity_id").eq("entity_type", "RECIPE").eq("event_type", "RECIPE_VIEW"),
    // 13. Saves
    sb.from("saves").select("recipe_id"),
    // 14. Audit logs
    (sb as any).from("admin_audit_logs").select("id, admin_id, action, target_type, target_id, created_at, profiles:admin_id(username)").order("created_at", { ascending: false }).limit(5),
  ])

  // Desempaquetado seguro de cada resultado
  const profilesData = results[0].status === "fulfilled" && results[0].value.data ? results[0].value.data : []
  const recipesData = results[1].status === "fulfilled" && results[1].value.data ? results[1].value.data : []
  const postsCount = results[2].status === "fulfilled" && typeof results[2].value.count === "number" ? results[2].value.count : 0
  const sessionsData = results[3].status === "fulfilled" && results[3].value.data ? results[3].value.data : []
  const activeStoriesCount = results[4].status === "fulfilled" && typeof results[4].value.count === "number" ? results[4].value.count : 0
  const foundersData = results[5].status === "fulfilled" && results[5].value.data ? results[5].value.data : []
  const pendingReportsCount = results[6].status === "fulfilled" && typeof results[6].value.count === "number" ? results[6].value.count : 0
  const openIncidentsCount = results[7].status === "fulfilled" && typeof results[7].value.count === "number" ? results[7].value.count : 0
  const eventsTodayCount = results[8].status === "fulfilled" && typeof results[8].value.count === "number" ? results[8].value.count : 0
  const events7dCount = results[9].status === "fulfilled" && typeof results[9].value.count === "number" ? results[9].value.count : 0
  const activeUsers7dData = results[10].status === "fulfilled" && results[10].value.data ? results[10].value.data : []
  const activeUsers30dData = results[11].status === "fulfilled" && results[11].value.data ? results[11].value.data : []
  const recipeViewsData = results[12].status === "fulfilled" && results[12].value.data ? results[12].value.data : []
  const savesData = results[13].status === "fulfilled" && results[13].value.data ? results[13].value.data : []
  const auditLogsData = results[14].status === "fulfilled" && results[14].value.data ? results[14].value.data : []

  // Métricas de usuarios
  const totalUsers = profilesData.length
  let newUsers7d = 0
  let newUsers30d = 0
  const t7 = new Date(d7Iso).getTime()
  const t30 = new Date(d30Iso).getTime()

  profilesData.forEach((p) => {
    if (!p.created_at) return
    const pt = new Date(p.created_at).getTime()
    if (pt >= t7) newUsers7d++
    if (pt >= t30) newUsers30d++
  })

  // Métricas de actividad (usuarios activos únicos)
  const unique7d = new Set(activeUsers7dData.map((e: any) => e.actor_id || e.visitor_id).filter(Boolean)).size
  const unique30d = new Set(activeUsers30dData.map((e: any) => e.actor_id || e.visitor_id).filter(Boolean)).size

  // Comunidad: Fundadores y Cuentas Profesionales
  const foundersAssigned = foundersData.length
  const foundersPendingEmail = foundersData.filter((f: any) => !f.welcome_email_sent_at).length

  let professionalTotal = 0
  const professionalBreakdown: Record<string, number> = {
    CHEF: 0,
    RESTAURANT: 0,
    CREATOR: 0,
    BRAND: 0,
    PRODUCER: 0,
    OTHER: 0,
  }

  profilesData.forEach((p) => {
    if (p.account_type === "PROFESSIONAL") {
      professionalTotal++
      const typeKey = (p.professional_type || "OTHER").toUpperCase()
      professionalBreakdown[typeKey] = (professionalBreakdown[typeKey] || 0) + 1
    }
  })

  // Cálculo de series temporales de crecimiento (7, 30 y 90 días)
  const computeGrowthSeries = (days: number): GrowthPoint[] => {
    const points: GrowthPoint[] = []
    const dayMs = 24 * 60 * 60 * 1000

    // Ordenar perfiles cronológicamente
    const sortedProfiles = [...profilesData].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))

    for (let i = 0; i < days; i++) {
      const currentDay = new Date(startDate.getTime() + i * dayMs)
      const dayEnd = new Date(currentDay.getTime() + dayMs)
      const isoDay = currentDay.toISOString().split("T")[0]

      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const label = `${currentDay.getDate()} ${monthNames[currentDay.getMonth()]}`

      const count = sortedProfiles.filter((p) => {
        const t = new Date(p.created_at).getTime()
        return t >= currentDay.getTime() && t < dayEnd.getTime()
      }).length

      const cumulative = sortedProfiles.filter((p) => {
        const t = new Date(p.created_at).getTime()
        return t < dayEnd.getTime()
      }).length

      points.push({ date: isoDay, label, count, cumulative })
    }
    return points
  }

  const growth7d = computeGrowthSeries(7)
  const growth30d = computeGrowthSeries(30)
  const growth90d = computeGrowthSeries(90)

  // Top Contenido (Vistas, Cocinadas, Guardadas)
  const viewCounts: Record<string, number> = {}
  recipeViewsData.forEach((v: any) => {
    if (v.entity_id) viewCounts[v.entity_id] = (viewCounts[v.entity_id] || 0) + 1
  })

  const cookedCounts: Record<string, number> = {}
  sessionsData.forEach((s: any) => {
    if (s.recipe_id) cookedCounts[s.recipe_id] = (cookedCounts[s.recipe_id] || 0) + 1
  })

  const savedCounts: Record<string, number> = {}
  savesData.forEach((s: any) => {
    if (s.recipe_id) savedCounts[s.recipe_id] = (savedCounts[s.recipe_id] || 0) + 1
  })

  const mapToTopRecipe = (r: any, count: number): TopRecipeItem => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      name: r.name || "Sin nombre",
      authorName: profile?.display_name || profile?.username || "Arrocero",
      authorUsername: profile?.username || "arrocero",
      count,
    }
  }

  const mostViewed: TopRecipeItem[] = [...recipesData]
    .map((r) => mapToTopRecipe(r, viewCounts[r.id] || 0))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const mostCooked: TopRecipeItem[] = [...recipesData]
    .map((r) => mapToTopRecipe(r, cookedCounts[r.id] || 0))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const mostSaved: TopRecipeItem[] = [...recipesData]
    .map((r) => mapToTopRecipe(r, savedCounts[r.id] || 0))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Auditoría reciente
  const recentAudit: AuditLogDisplayItem[] = (auditLogsData || []).map((log: any) => {
    const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
    return {
      id: log.id,
      actionLabel: formatActionLabel(log.action),
      targetType: log.target_type || null,
      targetId: log.target_id || null,
      createdAt: log.created_at,
      adminUsername: profile?.username || "Admin",
      relativeTime: formatRelativeTime(log.created_at),
    }
  })

  return {
    metrics: {
      totalUsers,
      newUsers7d,
      newUsers30d,
      publishedRecipes: recipesData.length,
      totalPosts: postsCount,
      activeStories: activeStoriesCount,
      totalSessions: sessionsData.length,
      activeUsers7d: unique7d,
      activeUsers30d: unique30d,
      eventsToday: eventsTodayCount,
      events7d: events7dCount,
      pendingReports: pendingReportsCount,
      openIncidents: openIncidentsCount,
    },
    growth: {
      d7: growth7d,
      d30: growth30d,
      d90: growth90d,
    },
    community: {
      foundersAssigned,
      foundersPendingEmail,
      professionalTotal,
      professionalBreakdown,
    },
    topContent: {
      mostViewed,
      mostCooked,
      mostSaved,
    },
    recentAudit,
    alerts: {
      pendingReports: pendingReportsCount,
      openIncidents: openIncidentsCount,
    },
  }
}
