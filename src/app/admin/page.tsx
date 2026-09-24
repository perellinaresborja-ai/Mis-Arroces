import Link from "next/link"
import { requireAdminSession } from "@/lib/admin/auth"
import {
  ShieldAlert,
  Users,
  UtensilsCrossed,
  Crown,
  BellRing,
  AlertTriangle,
  History,
  ShieldCheck,
  Activity,
  ArrowRight,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await requireAdminSession()

  const sections = [
    {
      href: "/admin/moderacion",
      title: "Moderación y Reportes",
      description: "Bandeja de denuncias de comunidad y reportes legales DSA de contenido ilícito.",
      icon: ShieldAlert,
      badge: "Prioridad",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      href: "/admin/usuarios",
      title: "Usuarios y Perfiles",
      description: "Búsqueda de cuentas, advertencias de conducta, suspensiones y estado general.",
      icon: Users,
      badge: "Gestión",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      href: "/admin/contenidos",
      title: "Recetas y Publicaciones",
      description: "Moderación de recetas, posts, Stories y comentarios públicos (ocultar/restaurar).",
      icon: UtensilsCrossed,
      badge: "Comunidad",
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      href: "/admin/fundadores",
      title: "Arroceros Fundadores",
      description: "Seguimiento del cupo 100, asignación manual de plazas y reenvío de bienvenida.",
      icon: Crown,
      badge: "Exclusivo",
      color: "text-amber-600 bg-amber-600/10 border-amber-600/20",
    },
    {
      href: "/admin/comunicaciones",
      title: "Comunicaciones y Push",
      description: "Emisión de notificaciones del sistema y campañas Push masivas a dispositivos.",
      icon: BellRing,
      badge: "Envíos",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      href: "/admin/incidencias",
      title: "Incidencias Técnicas",
      description: "Monitorización de errores cliente/servidor, fallos de API y salud de servicios.",
      icon: AlertTriangle,
      badge: "Monitor",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      href: "/admin/auditoria",
      title: "Registro de Auditoría",
      description: "Historial inmutable de todas las acciones administrativas ejecutadas en el panel.",
      icon: History,
      badge: "Seguridad",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Privado de Administración</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Hola, {session.profile.display_name || session.profile.username}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tienes acceso total como <strong className="text-foreground">{session.role}</strong>. Desde aquí
            gestionas la seguridad, moderación, fundadores y salud de <strong>misarroces</strong>.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Sistema: <strong>Operativo</strong></span>
          </div>
          <span className="text-border">•</span>
          <div>
            Privacidad de chats: <strong className="text-foreground">Protegida (sin acceso)</strong>
          </div>
          <span className="text-border">•</span>
          <div>
            Auditoría: <strong className="text-emerald-600 dark:text-emerald-400">Activa</strong>
          </div>
        </div>
      </div>

      {/* Grid of Operational Areas */}
      <div>
        <h2 className="text-base font-bold mb-3 px-1 text-foreground">Áreas de Gestión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <Link
                key={sec.href}
                href={sec.href}
                className="group bg-card border border-border rounded-3xl p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-2xl border ${sec.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {sec.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-border/50">
                  <span>Acceder</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
