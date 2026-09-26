import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminDashboardData } from "@/lib/admin/dashboard"
import { AdminAttentionBanner } from "./components/AdminAttentionBanner"
import { AdminMetricsGrid } from "./components/AdminMetricsGrid"
import { AdminUserGrowthChart } from "./components/AdminUserGrowthChart"
import { AdminTopContent } from "./components/AdminTopContent"
import { AdminCommunityBreakdown } from "./components/AdminCommunityBreakdown"
import { AdminRecentAudit } from "./components/AdminRecentAudit"
import { AdminQuickLinks } from "./components/AdminQuickLinks"
import { ShieldCheck, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await requireAdminSession()
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-6">
      {/* 1. Header / Welcome Banner */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Centro de Control · misarroces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Hola, {session.profile.display_name || session.profile.username}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Monitorización en tiempo real con datos de Supabase producción. Acceso autorizado como{" "}
            <strong className="text-foreground">{session.role}</strong>.
          </p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Base de datos: <strong className="text-foreground">Conectada</strong>
            </span>
          </div>
          <span className="text-border">•</span>
          <div>
            Analytics V1: <strong className="text-foreground">Activo</strong>
          </div>
          <span className="text-border">•</span>
          <div>
            Auditoría: <strong className="text-emerald-600 dark:text-emerald-400">En servicio</strong>
          </div>
        </div>
      </div>

      {/* 2. Alertas / Necesita Atención */}
      <AdminAttentionBanner
        pendingReports={data.alerts.pendingReports}
        openIncidents={data.alerts.openIncidents}
      />

      {/* 3. Cuadrícula de KPIs Principales */}
      <AdminMetricsGrid metrics={data.metrics} />

      {/* 4. Gráfica de Crecimiento de Usuarios */}
      <AdminUserGrowthChart growth={data.growth} />

      {/* 5. Lo que está funcionando (Top Contenido) */}
      <AdminTopContent topContent={data.topContent} />

      {/* 6. Comunidad: Fundadores y Cuentas Profesionales */}
      <AdminCommunityBreakdown community={data.community} />

      {/* 7. Actividad Administrativa Reciente */}
      <AdminRecentAudit logs={data.recentAudit} />

      {/* 8. Accesos Rápidos a Módulos */}
      <AdminQuickLinks
        pendingReports={data.alerts.pendingReports}
        openIncidents={data.alerts.openIncidents}
        foundersAssigned={data.community.foundersAssigned}
      />
    </div>
  )
}
