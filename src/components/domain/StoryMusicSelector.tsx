"use client"

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
  const [fragmentDurationMs, setFragmentDurationMs] = useState(isVideo ? maxDurationMs : 5000)
  const [durationInput, setDurationInput] = useState((fragmentDurationMs / 1000).toString())
  const [startTimeMs, setStartTimeMs] = useState(0)

  // Sync input string when duration changes externally
  useEffect(() => {
    setDurationInput(Math.round(fragmentDurationMs / 1000).toString())
  }, [fragmentDurationMs])
  
  const [volume, setVolume] = useState(1)
  const [originalVolume, setOriginalVolume] = useState(1)
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  // Container refs
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
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
      
      const actualDuration = Math.min(fragmentDurationMs, selectedTrack.duration_ms - startTimeMs);
      
      if (audio.currentTime * 1000 >= startTimeMs + actualDuration) {
        audio.currentTime = startTimeMs / 1000;
        audio.play().catch(console.error);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, startTimeMs, fragmentDurationMs, selectedTrack, playingId]);

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
    setTimeout(() => handlePlayPause(track), 100);
  }

  const handleConfirm = () => {
    if (!selectedTrack) return;
    const actualDuration = Math.min(fragmentDurationMs, selectedTrack.duration_ms - startTimeMs);
    
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

  // Timeline dimensions
  // Scale dynamically so the chosen duration fits in a ~280px window (or smaller for very short clips)
  // This makes the window visually responsive while ensuring even a 5-minute song can be selected without overflowing.
  const maxVisualDurationForScale = Math.max(15000, fragmentDurationMs);
  const maxWindowWidth = Math.min(280, containerWidth - 40); 
  const pixelsPerMs = maxWindowWidth / maxVisualDurationForScale;
  const windowWidth = fragmentDurationMs * pixelsPerMs;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!selectedTrack) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    
    const maxScroll = Math.max(0, (selectedTrack.duration_ms * pixelsPerMs) - windowWidth);
    const safeScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
    const newStart = Math.max(0, safeScroll / pixelsPerMs);
    
    setStartTimeMs(newStart);
    
    if (audioRef.current && playingId === selectedTrack.id) {
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

  const bars = useMemo(() => {
    if (!selectedTrack) return [];
    const trackWidth = selectedTrack.duration_ms * pixelsPerMs;
    const barsCount = Math.max(20, Math.floor(trackWidth / 5)); 
    let seed = 12345;
    for (let i = 0; i < selectedTrack.id.length; i++) seed += selectedTrack.id.charCodeAt(i);
    const res = [];
    for(let i=0; i<barsCount; i++) {
       const h = 20 + Math.abs(Math.sin(seed + i * 0.5) * 50 + Math.cos(seed * i * 0.1) * 20); 
       res.push(Math.min(100, Math.max(15, h)));
    }
    return res;
  }, [selectedTrack, pixelsPerMs]);

  const handleDurationBlur = () => {
    if (isVideo) return;
    let val = parseInt(durationInput);
    if (isNaN(val) || val < 1) val = 5;
    
    const maxAllowed = selectedTrack ? Math.floor(selectedTrack.duration_ms / 1000) : 600;
    if (val > maxAllowed) val = maxAllowed;
    
    setDurationInput(val.toString());
    const newDurationMs = val * 1000;
    setFragmentDurationMs(newDurationMs);
    
    // Auto-adjust scroll to keep startTimeMs valid if we expand duration near the end
    if (selectedTrack) {
        const maxStart = selectedTrack.duration_ms - newDurationMs;
        if (startTimeMs > maxStart) {
            setStartTimeMs(Math.max(0, maxStart));
        }
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      
      <div 
        ref={containerRef}
        className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 bg-card min-h-[60vh] max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        
        {!selectedTrack ? (
          // CATALOG VIEW
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Music className="w-5 h-5 text-orange-500" /> Buscar música
              </h3>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
              
              <div className="relative shadow-sm rounded-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Buscar música..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
                />
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {['Todas', 'Cooking', 'Chill', 'Mediterráneo', 'Fiesta', 'Elegante', 'Otros'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSearch(cat === 'Todas' ? '' : cat)}
                    className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap border transition-all shadow-sm ${search.toLowerCase() === cat.toLowerCase() || (cat === 'Todas' && !search) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
                  <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <div className="font-medium text-sm">Cargando catálogo...</div>
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 font-medium">No se encontraron pistas.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTracks.map(track => (
                    <div key={track.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border shadow-sm active:scale-[0.98] transition-all cursor-pointer" onClick={() => handleSelectTrack(track)}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => handlePlayPause(track, e)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm border border-border/50 ${playingId === track.id && isPlaying ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                        >
                          {playingId === track.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </button>
                        <div>
                          <div className="text-foreground font-bold line-clamp-1">{track.title}</div>
                          <div className="text-muted-foreground text-sm font-medium line-clamp-1">{track.artist}</div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-sm font-bold px-2">
                        {formatTime(track.duration_ms)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // FRAGMENT ADJUSTMENT VIEW
          <>
            <div className="p-4 border-b border-border flex items-center justify-between bg-card text-foreground">
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
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center bg-card text-foreground overflow-y-auto">
              
              {/* Duration input (Instagram style + Custom seconds) */}
              <div className={`w-14 h-14 mb-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-all overflow-hidden ${isVideo ? 'bg-muted text-muted-foreground border-border' : 'bg-orange-50 text-orange-600 border-orange-200 focus-within:bg-orange-100 focus-within:border-orange-400'}`}>
                <input 
                  type="number"
                  value={durationInput}
                  onChange={e => setDurationInput(e.target.value)}
                  onBlur={handleDurationBlur}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  disabled={isVideo}
                  className="w-5 bg-transparent text-right font-bold text-sm outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                  style={{ MozAppearance: 'textfield' }}
                />
                <span className="font-bold text-sm ml-0.5">s</span>
              </div>
              
              <div className="text-center mb-8 w-full px-4">
                <div className="text-xl font-bold text-foreground mb-1 line-clamp-1">{selectedTrack.title}</div>
                <div className="text-muted-foreground text-sm line-clamp-1">{selectedTrack.artist}</div>
              </div>

              {/* TIMELINE */}
              <div className="relative w-full flex flex-col items-center select-none mb-8">
                
                <div className="relative w-full overflow-hidden h-24 flex items-center rounded-xl bg-muted/30">
                  
                  {/* Fixed Window Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-20 flex justify-center h-full">
                    <div className="w-full h-full bg-background/60 backdrop-blur-[1px]" />
                    <div 
                      className="h-full border-x-[3px] border-y-2 border-orange-500 bg-orange-500/10 flex-shrink-0 relative shadow-sm transition-all duration-300"
                      style={{ width: windowWidth }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-orange-500 px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                           {formatTime(startTimeMs)}
                        </div>
                    </div>
                    <div className="w-full h-full bg-background/60 backdrop-blur-[1px]" />
                  </div>

                  {/* Scrollable Waveform */}
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="w-full overflow-x-auto no-scrollbar relative z-30 touch-pan-x h-full flex items-center"
                    style={{ scrollSnapType: 'none' }}
                  >
                    <div className="flex items-center h-full w-max">
                      {/* Left spacer so start of track can reach center window */}
                      <div style={{ width: Math.max(0, containerWidth / 2 - windowWidth / 2), flexShrink: 0 }} />
                      
                      {/* The track waveform */}
                      <div className="flex items-center h-16 flex-shrink-0 px-[2px] transition-all duration-300" style={{ width: selectedTrack.duration_ms * pixelsPerMs }}>
                        {bars.map((h, i) => (
                          <div key={i} className="flex-1 mx-[1px] rounded-full flex items-center justify-center h-full">
                            <div className="w-full bg-foreground opacity-20 rounded-full" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>

                      {/* Right spacer so end of track can reach center window */}
                      <div style={{ width: Math.max(0, containerWidth / 2 - windowWidth / 2), flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
                
              </div>

              {/* Playback Control */}
              <div className="flex justify-center mb-8">
                <button 
                  onClick={() => handlePlayPause(selectedTrack)} 
                  className="w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
              </div>

              {/* Volumes */}
              <div className="flex flex-col gap-4 w-full mb-6">
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
                    className="flex-1 accent-orange-500 h-1.5 bg-muted rounded-full appearance-none"
                  />
                </div>
                {isVideo && (
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium w-24">Audio original</span>
                    <input 
                      type="range" min={0} max={100} value={originalVolume * 100} 
                      onChange={e => setOriginalVolume(parseInt(e.target.value) / 100)}
                      className="flex-1 accent-orange-500 h-1.5 bg-muted rounded-full appearance-none"
                    />
                  </div>
                )}
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-sm"
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
