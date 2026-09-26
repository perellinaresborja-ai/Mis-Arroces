import Link from "next/link"
import { Crown, Briefcase, ArrowRight, AlertCircle, Sparkles } from "lucide-react"

interface CommunityBreakdownProps {
  community: {
    foundersAssigned: number
    foundersPendingEmail: number
    professionalTotal: number
    professionalBreakdown: Record<string, number>
  }
}

export function AdminCommunityBreakdown({ community }: CommunityBreakdownProps) {
  const { foundersAssigned, foundersPendingEmail, professionalTotal, professionalBreakdown } =
    community

  const founderPercent = Math.min(Math.round((foundersAssigned / 100) * 100), 100)
  const remainingFounders = Math.max(100 - foundersAssigned, 0)

  const profTypes = [
    { key: "CHEF", label: "Chefs", count: professionalBreakdown.CHEF || 0 },
    { key: "RESTAURANT", label: "Restaurantes", count: professionalBreakdown.RESTAURANT || 0 },
    { key: "CREATOR", label: "Creadores", count: professionalBreakdown.CREATOR || 0 },
    { key: "BRAND", label: "Marcas", count: professionalBreakdown.BRAND || 0 },
    { key: "PRODUCER", label: "Productores", count: professionalBreakdown.PRODUCER || 0 },
    { key: "OTHER", label: "Otros", count: professionalBreakdown.OTHER || 0 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* TARJETA 1: ARROCEROS FUNDADORES */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-600/10 text-amber-600 border border-amber-600/20">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Arroceros Fundadores</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Cupo 100
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{foundersAssigned}</span>
              <span className="text-muted-foreground text-sm font-semibold">/ 100 asignadas</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quedan <strong>{remainingFounders} plazas exclusivas</strong> disponibles.
            </p>
          </div>

          {/* Barra de progreso visual */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${founderPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{founderPercent}% completado</span>
              <span>{remainingFounders} vacantes</span>
            </div>
          </div>

          {/* Aviso si hay bienvenidas pendientes */}
          {foundersPendingEmail > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{foundersPendingEmail} fundador pendiente de email oficial de bienvenida.</span>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Todos los fundadores tienen su bienvenida al día.</span>
            </div>
          )}
        </div>

        <Link
          href="/admin/fundadores"
          className="inline-flex items-center justify-between text-xs font-semibold text-primary pt-3 border-t border-border/50 hover:underline"
        >
          <span>Gestionar Arroceros Fundadores</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* TARJETA 2: CUENTAS PROFESIONALES */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Cuentas Profesionales</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Sector
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{professionalTotal}</span>
              <span className="text-muted-foreground text-sm font-semibold">profesionales registrados</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Desglose según la clasificación establecida en el perfil:
            </p>
          </div>

          {/* Pastillas de tipos profesionales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {profTypes.map((t) => (
              <div
                key={t.key}
                className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 text-center min-w-0 flex flex-col items-center justify-center"
              >
                <span className="text-base font-black text-foreground block">{t.count}</span>
                <span
                  className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate w-full"
                  title={t.label}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/admin/usuarios"
          className="inline-flex items-center justify-between text-xs font-semibold text-primary pt-3 border-t border-border/50 hover:underline"
        >
          <span>Ver usuarios y perfiles profesionales</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
