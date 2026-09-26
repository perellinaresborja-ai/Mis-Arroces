"use client"

import { useState, useRef } from "react"
import {
  Music,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react"
import { toggleMusicTrackActive } from "@/app/actions/admin"
import { fixMojibake } from "@/lib/utils"

export interface MusicTrackItem {
  id: string
  title: string
  artist: string
  audioUrl: string
  durationMs: number | null
  category: string | null
  sourceLicense: string | null
  sourceUrl: string | null
  active: boolean
  createdAt: string
  fileHash: string | null
}

export function MusicTracksManager({ initialTracks }: { initialTracks: MusicTrackItem[] }) {
  const [tracks, setTracks] = useState<MusicTrackItem[]>(initialTracks)
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatDuration = (ms: number | null) => {
    if (!ms) return "--:--"
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handlePlayPause = (track: MusicTrackItem) => {
    if (currentPlayingId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play().catch(console.error)
        setIsPlaying(true)
      }
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    audioRef.current = new Audio(track.audioUrl)
    audioRef.current.onended = () => {
      setIsPlaying(false)
      setCurrentPlayingId(null)
    }
    audioRef.current.onerror = () => {
      setIsPlaying(false)
      setCurrentPlayingId(null)
    }

    audioRef.current.play().catch(console.error)
    setCurrentPlayingId(track.id)
    setIsPlaying(true)
  }

  const handleToggleActive = async (track: MusicTrackItem) => {
    const nextVal = !track.active
    setLoadingId(track.id)
    try {
      await toggleMusicTrackActive(track.id, nextVal)
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, active: nextVal } : t))
      )
    } catch (e: any) {
      alert(e.message || "Error al actualizar estado")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <span>Pistas en el Catálogo de Stories</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pistas disponibles en producción para la ambientación sonora de Stories.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted border border-border">
          Total: <strong>{tracks.length}</strong>
        </span>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {tracks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Aún no hay pistas importadas en el catálogo. Utiliza el importador superior para añadir pistas MP3/M4A.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4 w-12 text-center">Audio</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Artista</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Duración</th>
                  <th className="p-4">Licencia</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tracks.map((t) => {
                  const isThisPlaying = currentPlayingId === t.id && isPlaying

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handlePlayPause(t)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
                            isThisPlaying
                              ? "bg-primary text-white animate-pulse"
                              : "bg-muted text-foreground hover:bg-primary hover:text-white"
                          }`}
                          title={isThisPlaying ? "Pausar" : "Escuchar"}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-foreground max-w-[200px] truncate">
                        {fixMojibake(t.title)}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-semibold">
                        {fixMojibake(t.artist)}
                      </td>
                      <td className="p-4 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-semibold">
                          {fixMojibake(t.category) || "General"}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-muted-foreground">
                        {formatDuration(t.durationMs)}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground truncate max-w-[120px]">
                        {t.sourceUrl ? (
                          <a
                            href={t.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>{t.sourceLicense || "Libre"}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                          </a>
                        ) : (
                          t.sourceLicense || "Libre"
                        )}
                      </td>
                      <td className="p-4">
                        {t.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Inactiva
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          disabled={loadingId === t.id}
                          onClick={() => handleToggleActive(t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            t.active
                              ? "bg-muted border-border hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {t.active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
