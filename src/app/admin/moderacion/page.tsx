import { requireAdminSession } from "@/lib/admin/auth"
import { ShieldAlert } from "lucide-react"

export default async function AdminModeracionPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Moderación y Reportes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bandeja de denuncias de usuarios y notificaciones legales de contenido ilícito (DSA).
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Bandeja de Moderación Preparada</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          La tabla <code>moderation_reports</code> ya está capturando reportes. La interfaz de gestión interactiva se conectará en el Bloque 3.
        </p>
      </div>
    </div>
  )
}
