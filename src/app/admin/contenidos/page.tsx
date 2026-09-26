import Link from "next/link"
import { requireAdminSession } from "@/lib/admin/auth"
import { UtensilsCrossed, Music, ArrowRight } from "lucide-react"

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
            Moderación de contenido público, recetas, publicaciones, Stories y catálogo multimedia.
          </p>
        </div>
      </div>

      {/* Subsecciones disponibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/contenidos/musica"
          className="group bg-card border border-border rounded-3xl p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between gap-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl border text-primary bg-primary/10 border-primary/20">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                Herramienta
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Música para Stories
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                Importador masivo de pistas de audio libres de derechos para el selector de Stories.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-border/50">
            <span>Abrir importador</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg">Módulo de Contenido Preparado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Las acciones de ocultar, restaurar y gestionar recetas y publicaciones se conectarán en el Bloque de Contenido.
        </p>
      </div>
    </div>
  )
}
