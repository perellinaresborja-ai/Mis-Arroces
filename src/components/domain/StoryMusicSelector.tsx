"use client"

import { useState, useEffect, useRef } from "react"
import { getMusicCatalog } from "@/app/actions/stories"
import { Music, Play, Pause, X, Search, Volume2 } from "lucide-react"

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audio_url: string
  duration_ms: number
  category: string
}

export function StoryMusicSelector({ onSelect, onClose, maxDurationMs, isVideo = false }: { onSelect: (config: any) => void, onClose: () => void, maxDurationMs: number, isVideo?: boolean }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  
  // Fragment selector state
  const [startTimeMs, setStartTimeMs] = useState(0)
  const [volume, setVolume] = useState(1)
  const [photoDurationMs, setPhotoDurationMs] = useState(5000)
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  useEffect(() => {
    async function fetchTracks() {
      const data = await getMusicCatalog()
      setTracks(data as MusicTrack[])
      setLoading(false)
    }
    fetchTracks()
  }, [])
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handlePlayPause = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingId === track.id && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    const audio = new Audio(track.audio_url)
    audioRef.current = audio
    audio.play().then(() => {
      setPlayingId(track.id)
      setIsPlaying(true)
    }).catch(console.error)
    
    audio.onended = () => {
      setIsPlaying(false)
      setPlayingId(null)
    }
  }

  const handleSelectTrack = (track: MusicTrack) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
    setSelectedTrack(track)
    setStartTimeMs(0)
  }

  const handleConfirm = () => {
    if (!selectedTrack) return
    const targetDuration = isVideo ? maxDurationMs : photoDurationMs;
    const actualDuration = Math.min(targetDuration, selectedTrack.duration_ms - startTimeMs)
    onSelect({
      track_id: selectedTrack.id,
      start_time_ms: startTimeMs,
      duration_ms: actualDuration,
      music_volume: volume,
      _trackMeta: selectedTrack
    })
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseInt(e.target.value)
    setStartTimeMs(newStart)
    
    // Preview from new point
    if (audioRef.current) {
      audioRef.current.currentTime = newStart / 1000
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
      }
    } else if (selectedTrack) {
      const audio = new Audio(selectedTrack.audio_url)
      audioRef.current = audio
      audio.currentTime = newStart / 1000
      audio.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.artist.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music className="w-5 h-5" /> 
            {selectedTrack ? "Ajustar fragmento" : "Añadir Música"}
          </h3>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!selectedTrack ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input 
                type="text"
                placeholder="Buscar música..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-9 pr-4 text-white focus:outline-none focus:border-white/40"
              />
            </div>
            
            {loading ? (
              <div className="text-center text-white/50 py-8">Cargando catálogo...</div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center text-white/50 py-8">No se encontraron pistas.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredTracks.map(track => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group" onClick={() => handleSelectTrack(track)}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handlePlayPause(track, e)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        {playingId === track.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-white font-medium line-clamp-1">{track.title}</div>
                        <div className="text-white/60 text-sm line-clamp-1">{track.artist}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col gap-8">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">{selectedTrack.title}</div>
              <div className="text-white/60">{selectedTrack.artist}</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>0:00</span>
                <span>Fragmento: {Math.min(Math.round(maxDurationMs/1000), Math.round(selectedTrack.duration_ms/1000))}s</span>
                <span>{Math.floor(selectedTrack.duration_ms / 60000)}:{(Math.floor((selectedTrack.duration_ms % 60000)/1000)).toString().padStart(2, '0')}</span>
              </div>
              <input 
                type="range"
                min={0}
                max={Math.max(0, selectedTrack.duration_ms - maxDurationMs)}
                value={startTimeMs}
                onChange={handleSliderChange}
                className="w-full accent-white"
              />
              <div className="text-center text-xs text-white/50 mt-1">Desliza para elegir el punto de inicio</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white/70">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Volumen de música</span>
              </div>
              <input 
                type="range"
                min={0}
                max={100}
                value={volume * 100}
                onChange={e => {
                  const v = parseInt(e.target.value) / 100;
                  setVolume(v);
                  if (audioRef.current) audioRef.current.volume = v;
                }}
                className="w-full accent-white"
              />
            </div>

            {!isVideo && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/70 justify-between">
                  <span className="text-sm">Duración de la historia</span>
                  <span className="text-sm font-bold text-white">{photoDurationMs / 1000}s</span>
                </div>
                <input 
                  type="range"
                  min={5000}
                  max={15000}
                  step={1000}
                  value={photoDurationMs}
                  onChange={e => setPhotoDurationMs(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            )}

            <button 
              onClick={handleConfirm}
              className="mt-auto w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
