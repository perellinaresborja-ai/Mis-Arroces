import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Music, Play, Pause, Search, X, Volume2, ArrowLeft, Video } from 'lucide-react'
import { getMusicCatalog } from '@/app/actions/stories'

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
  const [originalVolume, setOriginalVolume] = useState(1)
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  // Container refs
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(300)

  useEffect(() => {
    getMusicCatalog().then(data => {
      setTracks(data)
      setLoading(false)
    }).catch(console.error)
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Setup resize observer for the modal width to perfectly center the timeline
  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.clientWidth);
    const ro = new ResizeObserver(entries => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [selectedTrack]);

  // Handle fragment playback loop
  useEffect(() => {
    if (!isPlaying || !audioRef.current || !selectedTrack || playingId !== selectedTrack.id) return;
    
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const targetDuration = isVideo ? maxDurationMs : 5000;
      const actualDuration = Math.min(targetDuration, selectedTrack.duration_ms - startTimeMs);
      
      // If we reach the end of the fragment, loop back to the start of the fragment
      if (audio.currentTime * 1000 >= startTimeMs + actualDuration) {
        audio.currentTime = startTimeMs / 1000;
        audio.play().catch(console.error);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, startTimeMs, maxDurationMs, isVideo, selectedTrack, playingId]);

  const handlePlayPause = (track: MusicTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (playingId === track.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(track.audio_url);
    audioRef.current = audio;
    
    // If we are playing the selected track (preview mode), start from startTimeMs
    if (selectedTrack && track.id === selectedTrack.id) {
      audio.currentTime = startTimeMs / 1000;
      audio.volume = volume;
    }
    
    audio.play().then(() => {
      setPlayingId(track.id);
      setIsPlaying(true);
    }).catch(console.error);
    
    audio.onended = () => {
      setIsPlaying(false);
      setPlayingId(null);
    };
  }

  const handleSelectTrack = (track: MusicTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    setSelectedTrack(track);
    setStartTimeMs(0);
    // Auto-play the selected track
    setTimeout(() => handlePlayPause(track), 100);
  }

  const handleConfirm = () => {
    if (!selectedTrack) return;
    const targetDuration = isVideo ? maxDurationMs : 5000;
    const actualDuration = Math.min(targetDuration, selectedTrack.duration_ms - startTimeMs);
    
    onSelect({
      track_id: selectedTrack.id,
      start_time_ms: startTimeMs,
      duration_ms: actualDuration,
      music_volume: volume,
      original_audio_volume: isVideo ? originalVolume : undefined,
      _trackMeta: selectedTrack
    });
  }

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.artist.toLowerCase().includes(search.toLowerCase())
  )

  // -- Timeline Logic --
  const fragmentDuration = isVideo ? maxDurationMs : 5000;
  const windowWidth = Math.min(240, containerWidth - 60); 
  const pixelsPerMs = windowWidth / fragmentDuration;
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!selectedTrack) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    // Cap at duration
    const maxScroll = Math.max(0, (selectedTrack.duration_ms * pixelsPerMs) - windowWidth);
    const safeScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
    const newStart = Math.max(0, safeScroll / pixelsPerMs);
    
    setStartTimeMs(newStart);
    
    // Smooth visual update without glitching audio
    if (audioRef.current && playingId === selectedTrack.id) {
       // Only seek if we drag far enough to avoid stutter, or let the loop catch it.
       // For a smooth UX, we actually just update currentTime
       audioRef.current.currentTime = newStart / 1000;
       if (!isPlaying) {
         audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
       }
    }
  }

  const formatTime = (ms: number) => {
    const totalS = Math.floor(ms / 1000);
    const m = Math.floor(totalS / 60);
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Generate deterministic pseudo-waveform
  const bars = useMemo(() => {
    if (!selectedTrack) return [];
    const trackWidth = selectedTrack.duration_ms * pixelsPerMs;
    const barsCount = Math.min(150, Math.floor(trackWidth / 8)); 
    let seed = 12345;
    for (let i = 0; i < selectedTrack.id.length; i++) seed += selectedTrack.id.charCodeAt(i);
    const res = [];
    for(let i=0; i<barsCount; i++) {
       const h = 20 + Math.abs(Math.sin(seed + i * 0.5) * 50 + Math.cos(seed * i * 0.1) * 20); 
       res.push(Math.min(100, Math.max(15, h)));
    }
    return res;
  }, [selectedTrack, pixelsPerMs]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      
      {/* Container */}
      <div 
        ref={containerRef}
        className={`w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${!selectedTrack ? 'bg-zinc-900 max-h-[85vh]' : 'bg-card max-h-[90vh]'}`} 
        onClick={e => e.stopPropagation()}
      >
        
        {!selectedTrack ? (
          // --- CATALOG VIEW ---
          <>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Music className="w-5 h-5" /> Añadir Música
              </h3>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
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

              {/* Chips Categorías simples */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Todas', 'Cooking', 'Chill', 'Mediterráneo', 'Fiesta', 'Elegante', 'Otros'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSearch(cat === 'Todas' ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${search.toLowerCase() === cat.toLowerCase() || (cat === 'Todas' && !search) ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {loading ? (
                <div className="text-center text-white/50 py-8">Cargando catálogo...</div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center text-white/50 py-8">No se encontraron pistas.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredTracks.map(track => (
                    <div key={track.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors" onClick={() => handleSelectTrack(track)}>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => handlePlayPause(track, e)}
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                        >
                          {playingId === track.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-white font-medium line-clamp-1">{track.title}</div>
                          <div className="text-white/60 text-sm line-clamp-1">{track.artist}</div>
                        </div>
                      </div>
                      <div className="text-white/40 text-sm">
                        {formatTime(track.duration_ms)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // --- FRAGMENT ADJUSTMENT VIEW ---
          <>
            <div className="p-4 border-b flex items-center justify-between bg-card text-card-foreground">
              <button 
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setSelectedTrack(null);
                  setIsPlaying(false);
                }} 
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold">Elegir fragmento</h3>
              <div className="w-9" />
            </div>

            <div className="flex-1 p-6 flex flex-col gap-8 bg-card text-card-foreground overflow-y-auto">
              
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200 shadow-sm">
                  <Music className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground mb-1 line-clamp-1">{selectedTrack.title}</div>
                  <div className="text-muted-foreground text-sm line-clamp-1">{selectedTrack.artist}</div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="relative w-full flex flex-col items-center select-none">
                <div className="text-2xl font-bold text-foreground mb-3 font-mono">
                  {formatTime(startTimeMs)}
                </div>
                
                <div className="relative w-full overflow-hidden bg-muted/30 py-6 rounded-3xl border border-border">
                  
                  {/* Fixed Window Mask */}
                  <div className="absolute inset-0 pointer-events-none z-20 flex justify-center">
                    <div className="w-full h-full bg-background/60 backdrop-blur-[1px]" />
                    <div 
                      className="h-full border-x-2 border-y-2 border-orange-500 bg-orange-500/10 flex-shrink-0 relative shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                      style={{ width: windowWidth }}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        {Math.round(fragmentDuration / 1000)} s
                      </div>
                    </div>
                    <div className="w-full h-full bg-background/60 backdrop-blur-[1px]" />
                  </div>

                  {/* Scrollable Waveform */}
                  <div 
                    onScroll={handleScroll}
                    className="w-full overflow-x-auto no-scrollbar relative z-30 touch-pan-x"
                    style={{ scrollSnapType: 'none' }}
                  >
                    <div className="flex items-center h-16 w-max">
                      <div style={{ width: Math.max(0, containerWidth / 2 - windowWidth / 2), flexShrink: 0 }} />
                      
                      <div className="flex items-center h-full flex-shrink-0 px-[2px]" style={{ width: selectedTrack.duration_ms * pixelsPerMs }}>
                        {bars.map((h, i) => (
                          <div key={i} className="flex-1 mx-[1px] bg-foreground/80 rounded-full flex items-center justify-center h-full">
                            <div className="w-full bg-foreground rounded-full" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>

                      <div style={{ width: Math.max(0, containerWidth / 2 - windowWidth / 2), flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
                
                <div className="flex w-full justify-between mt-3 text-xs text-muted-foreground font-medium px-2">
                  <span>0:00</span>
                  <span>{formatTime(selectedTrack.duration_ms)}</span>
                </div>
              </div>

              {/* Playback Control */}
              <div className="flex justify-center -mt-2">
                <button 
                  onClick={() => handlePlayPause(selectedTrack)} 
                  className="w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
              </div>

              {/* Volumes */}
              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium w-24">Música</span>
                  <input 
                    type="range" min={0} max={100} value={volume * 100} 
                    onChange={e => {
                      const v = parseInt(e.target.value) / 100;
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v;
                    }}
                    className="flex-1 accent-foreground h-1.5 bg-muted rounded-full appearance-none"
                  />
                </div>
                {isVideo && (
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium w-24">Vídeo original</span>
                    <input 
                      type="range" min={0} max={100} value={originalVolume * 100} 
                      onChange={e => setOriginalVolume(parseInt(e.target.value) / 100)}
                      className="flex-1 accent-foreground h-1.5 bg-muted rounded-full appearance-none"
                    />
                  </div>
                )}
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-sm"
              >
                Usar este fragmento
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
