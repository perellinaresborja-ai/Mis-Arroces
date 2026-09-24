import { requireAdminSession } from "@/lib/admin/auth"
import { History } from "lucide-react"

export default async function AdminAuditoriaPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Historial inmutable de acciones administrativas ejecutadas en Mi Admin.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <History className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Auditoría Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          La tabla <code>admin_audit_logs</code> y el helper <code>logAdminAction</code> ya están integrados para registrar automáticamente las acciones del panel.
        </p>
      </div>
    </div>
  )
}
