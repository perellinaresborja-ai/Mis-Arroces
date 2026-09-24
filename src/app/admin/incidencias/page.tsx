import { requireAdminSession } from "@/lib/admin/auth"
import { AlertTriangle } from "lucide-react"

export default async function AdminIncidenciasPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Incidencias Técnicas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro de errores de cliente/servidor y monitorización del estado de servicios.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Incidencias Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          El visor de incidencias técnicas en tiempo real se conectará en el Bloque 7.
        </p>
      </div>
    </div>
  )
}
