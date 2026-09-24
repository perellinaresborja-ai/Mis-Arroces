import { requireAdminSession } from "@/lib/admin/auth"
import { BellRing } from "lucide-react"

export default async function AdminComunicacionesPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
          <BellRing className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Comunicaciones y Push</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Emisión de avisos del sistema y difusión de notificaciones Push masivas.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <BellRing className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Comunicaciones Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          El tipo <code>SYSTEM</code> y el pipeline de Web Push están listos. El formulario de redacción y emisión de campañas masivas se conectará en el Bloque 6.
        </p>
      </div>
    </div>
  )
}
