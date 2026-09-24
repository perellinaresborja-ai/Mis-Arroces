import { requireAdminSession } from "@/lib/admin/auth"
import { Crown } from "lucide-react"

export default async function AdminFundadoresPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-600 border border-amber-600/20">
          <Crown className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Arroceros Fundadores</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de las 100 plazas fundadoras exclusivas de misarroces.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <Crown className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Fundadores Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          La tabla <code>founders</code> ya controla las plazas 0 a 99. La tabla administrativa y los reenvíos de bienvenida se conectarán en el Bloque 5.
        </p>
      </div>
    </div>
  )
}
