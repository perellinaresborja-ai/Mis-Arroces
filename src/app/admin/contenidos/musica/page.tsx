import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import { MusicBulkImporter } from "@/components/admin/MusicBulkImporter"
import { MusicTracksManager, MusicTrackItem } from "@/components/admin/MusicTracksManager"
import Link from "next/link"
import { Music, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminMusicPage() {
  await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  // Cargar catálogo de pistas reales existentes
  const { data: rawTracks } = await adminClient
    .from("story_music_tracks")
    .select(`
      id, title, artist, audio_url, duration_ms, category,
      source_license, source_url, active, created_at, file_hash
    `)
    .order("created_at", { ascending: false })

  const tracks: MusicTrackItem[] = (rawTracks || []).map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    audioUrl: t.audio_url,
    durationMs: t.duration_ms,
    category: t.category,
    sourceLicense: t.source_license,
    sourceUrl: t.source_url,
    active: t.active !== false,
    createdAt: t.created_at,
    fileHash: t.file_hash,
  }))

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Catálogo Musical de Stories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestor de pistas activas e importador masivo libre de derechos para Stories.
            </p>
          </div>
        </div>

        <Link
          href="/admin/contenidos"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card border border-border rounded-full transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
      </div>

      {/* 1. Catálogo actual con reproductor y toggle */}
      <MusicTracksManager initialTracks={tracks} />

      {/* 2. Importador masivo existente intacto */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-foreground">Importador Masivo de Pistas</h3>
        <p className="text-xs text-muted-foreground">
          Sube archivos de audio (MP3 o M4A). Se verificarán duplicados mediante hash SHA-256 antes de guardarlos.
        </p>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <MusicBulkImporter />
        </div>
      </div>
    </div>
  )
}
