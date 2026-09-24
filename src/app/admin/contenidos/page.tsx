import { requireAdminSession } from "@/lib/admin/auth"
import { UtensilsCrossed } from "lucide-react"

export default async function AdminContenidosPage() {
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Recetas y Publicaciones</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Moderación de contenido público, recetas, publicaciones y comentarios.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Contenido Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Las acciones de ocultar, restaurar y gestionar contenido público se conectarán en el Bloque 4.
        </p>
      </div>
    </div>
  )
}
