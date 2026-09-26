import { requireAdminSession } from "@/lib/admin/auth"
import { MusicBulkImporter } from "@/components/admin/MusicBulkImporter"
import Link from "next/link"
import { Music, ArrowLeft } from "lucide-react"

export default async function AdminMusicPage() {
  // Proteger con sesión admin
  await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Catálogo Musical de Stories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Importador masivo de pistas de audio libres de derechos para Stories.
            </p>
          </div>
        </div>

        <Link
          href="/admin/contenidos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card border border-border rounded-full transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <MusicBulkImporter />
      </div>
    </div>
  )
}
