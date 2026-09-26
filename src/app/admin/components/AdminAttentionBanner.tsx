import Link from "next/link"
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react"

interface AdminAttentionBannerProps {
  pendingReports: number
  openIncidents: number
}

export function AdminAttentionBanner({
  pendingReports,
  openIncidents,
}: AdminAttentionBannerProps) {
  const hasPendingItems = pendingReports > 0 || openIncidents > 0

  if (!hasPendingItems) {
    return (
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              Todo al día en misarroces
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              No hay denuncias pendientes de revisión ni incidencias técnicas abiertas.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span>0 pendientes</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Necesita Atención Inmediata
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pendingReports > 0 && (
          <Link
            href="/admin/moderacion"
            className="group bg-card border border-amber-500/30 hover:border-amber-500 rounded-3xl p-4 transition-all shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">Denuncias pendientes</span>
                  <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-amber-500 text-white">
                    {pendingReports}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Reportes de usuarios o avisos DSA por revisar
                </p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}

        {openIncidents > 0 && (
          <Link
            href="/admin/incidencias"
            className="group bg-card border border-rose-500/30 hover:border-rose-500 rounded-3xl p-4 transition-all shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">Incidencias abiertas</span>
                  <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-rose-500 text-white">
                    {openIncidents}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Errores de cliente o caídas interceptadas
                </p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}
