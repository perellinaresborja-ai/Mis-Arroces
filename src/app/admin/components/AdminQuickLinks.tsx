import Link from "next/link"
import {
  ShieldAlert,
  Users,
  UtensilsCrossed,
  Crown,
  BellRing,
  AlertTriangle,
  History,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface QuickLinksProps {
  pendingReports: number
  openIncidents: number
  foundersAssigned: number
}

export function AdminQuickLinks({
  pendingReports,
  openIncidents,
  foundersAssigned,
}: QuickLinksProps) {
  const sections = [
    {
      href: "/admin/moderacion",
      title: "Moderación",
      subtitle: pendingReports > 0 ? `${pendingReports} pendientes` : "Bandeja de reportes",
      icon: ShieldAlert,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: pendingReports > 0 ? `${pendingReports}` : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      href: "/admin/usuarios",
      title: "Usuarios",
      subtitle: "Perfiles y suspensiones",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      href: "/admin/contenidos",
      title: "Contenido",
      subtitle: "Recetas, posts y música",
      icon: UtensilsCrossed,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      href: "/admin/fundadores",
      title: "Fundadores",
      subtitle: `${foundersAssigned}/100 plazas`,
      icon: Crown,
      color: "text-amber-600 bg-amber-600/10 border-amber-600/20",
    },
    {
      href: "/admin/comunicaciones",
      title: "Comunicaciones",
      subtitle: "Push masivo y avisos",
      icon: BellRing,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      href: "/admin/incidencias",
      title: "Incidencias",
      subtitle: openIncidents > 0 ? `${openIncidents} abiertas` : "Telemetría técnica",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      badge: openIncidents > 0 ? `${openIncidents}` : null,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      href: "/admin/auditoria",
      title: "Auditoría",
      subtitle: "Registro inmutable",
      icon: History,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-sm text-foreground">Accesos Rápidos a Módulos</h3>
        <span className="text-[11px] text-muted-foreground">7 herramientas operativas</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sections.map((sec) => {
          const Icon = sec.icon
          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="group bg-card border border-border hover:border-primary/50 rounded-3xl p-3.5 transition-all shadow-sm flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-2xl border ${sec.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {sec.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${sec.badgeColor}`}>
                    {sec.badge}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {sec.title}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">{sec.subtitle}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-primary pt-1.5 border-t border-border/40">
                <span>Entrar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
