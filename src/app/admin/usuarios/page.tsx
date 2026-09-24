import { requireAdminSession } from "@/lib/admin/auth"
import { Users } from "lucide-react"

export default async function AdminUsuariosPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consulta de perfiles, suspensiones, advertencias y estado de cuentas en misarroces.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Usuarios Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Los estados de cuenta (<code>ACTIVE</code>, <code>SUSPENDED</code>, <code>DELETED</code>) están definidos en base de datos. Las acciones de gestión se conectarán en el Bloque 4.
        </p>
      </div>
    </div>
  )
}
