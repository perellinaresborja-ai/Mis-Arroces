import Link from "next/link"
import { AuditLogDisplayItem } from "@/lib/admin/dashboard"
import { History, ArrowRight, Shield } from "lucide-react"

interface RecentAuditProps {
  logs: AuditLogDisplayItem[]
}

export function AdminRecentAudit({ logs }: RecentAuditProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-foreground">Actividad Administrativa Reciente</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Últimas acciones registradas en el registro inmutable de auditoría.
          </p>
        </div>

        <Link
          href="/admin/auditoria"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          <span>Ver auditoría completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/80">
          <Shield className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
          <p>Sin acciones administrativas registradas recientemente.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {logs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{log.actionLabel}</p>
                  <p className="text-[11px] text-muted-foreground">
                    por <span className="text-foreground/80 font-medium">@{log.adminUsername}</span>
                    {log.targetType && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase font-mono">
                        {log.targetType}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <span className="text-muted-foreground whitespace-nowrap text-[11px] shrink-0 font-mono">
                {log.relativeTime}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
