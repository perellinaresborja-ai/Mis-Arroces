import { Users, UtensilsCrossed, Activity, ShieldCheck, Flame, Radio, Image as ImageIcon, TrendingUp } from "lucide-react"

interface MetricsGridProps {
  metrics: {
    totalUsers: number
    organicUsers?: number
    newUsers7d: number
    newUsers30d: number
    publishedRecipes: number
    totalPosts: number
    activeStories: number
    totalSessions: number
    activeUsers7d: number
    activeUsers30d: number
    visitors7d?: number
    visitors30d?: number
    eventsToday: number
    events7d: number
    pendingReports: number
    openIncidents: number
  }
}

export function AdminMetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* BLOQUE 1: USUARIOS */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Usuarios</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              Comunidad
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {metrics.totalUsers.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">perfiles registrados</span>
            </div>
            {typeof metrics.organicUsers === 'number' && (
              <p className="text-xs text-muted-foreground mt-1">
                <strong>{metrics.organicUsers}</strong> perfiles orgánicos activos
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
            <div className="bg-muted/40 rounded-2xl p-2.5">
              <p className="text-[11px] text-muted-foreground">Últimos 7 días</p>
              <p className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1">
                <span className="text-blue-500 font-extrabold">+{metrics.newUsers7d}</span>
              </p>
            </div>
            <div className="bg-muted/40 rounded-2xl p-2.5">
              <p className="text-[11px] text-muted-foreground">Últimos 30 días</p>
              <p className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1">
                <span className="text-blue-500 font-extrabold">+{metrics.newUsers30d}</span>
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: CONTENIDO */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Contenido</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              Publicado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {metrics.publishedRecipes}
              </span>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <UtensilsCrossed className="w-3 h-3 text-primary" /> Recetas
              </p>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {metrics.totalPosts}
              </span>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <ImageIcon className="w-3 h-3 text-amber-500" /> Posts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
            <div className="bg-muted/40 rounded-2xl p-2.5">
              <p className="text-[11px] text-muted-foreground">Stories activas</p>
              <p className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                <span>{metrics.activeStories}</span>
              </p>
            </div>
            <div className="bg-muted/40 rounded-2xl p-2.5">
              <p className="text-[11px] text-muted-foreground">Cocinados</p>
              <p className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>{metrics.totalSessions}</span>
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: ACTIVIDAD (ANALYTICS V1) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Actividad Real</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              Analytics V1
            </span>
          </div>

          {/* Fila 1: Usuarios registrados activos */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-500" /> Usuarios activos (registrados)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-2xl p-2.5">
                <span className="text-2xl font-black text-foreground">{metrics.activeUsers7d}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Últimos 7 días</p>
              </div>
              <div className="bg-muted/40 rounded-2xl p-2.5">
                <span className="text-2xl font-black text-foreground">{metrics.activeUsers30d}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Últimos 30 días</p>
              </div>
            </div>
          </div>

          {/* Fila 2: Visitantes únicos web */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-500" /> Visitantes web únicos
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded-2xl p-2">
                <span className="text-lg font-bold text-foreground">{metrics.visitors7d ?? 0}</span>
                <p className="text-[10px] text-muted-foreground">Únicos 7 días</p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-2">
                <span className="text-lg font-bold text-foreground">{metrics.visitors30d ?? 0}</span>
                <p className="text-[10px] text-muted-foreground">Únicos 30 días</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <span>Eventos hoy: <strong>{metrics.eventsToday}</strong></span>
            <span>7 días: <strong>{metrics.events7d.toLocaleString()}</strong></span>
          </div>
        </div>

      </div>
    </div>
  )
}
