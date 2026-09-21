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
  cover_url?: string
  category: string
}

export function StoryMusicSelector({ onSelect, onClose, maxDurationMs, isVideo = false, initialConfig, videoRef }: { onSelect: (config: any) => void, onClose: () => void, maxDurationMs: number, isVideo?: boolean, initialConfig?: any, videoRef?: React.RefObject<HTMLVideoElement | null> }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(initialConfig?._trackMeta || null)
  const [startTimeMs, setStartTimeMs] = useState(initialConfig?.start_time_ms || 0)
  const [fragmentDurationMs, setFragmentDurationMs] = useState(initialConfig?.duration_ms || Math.min(15000, maxDurationMs))
  const [volume, setVolume] = useState(initialConfig?.music_volume ?? 1)
  const [originalVolume, setOriginalVolume] = useState(initialConfig?.original_audio_volume ?? 1)
  
  const [durationInput, setDurationInput] = useState(Math.round((initialConfig?.duration_ms || Math.min(15000, maxDurationMs)) / 1000).toString())
  
  useEffect(() => {
    setDurationInput(Math.round(fragmentDurationMs / 1000).toString())
  }, [fragmentDurationMs])
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  // Waveform state
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(300)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
      const observer = new ResizeObserver(entries => {
        setContainerWidth(entries[0].contentRect.width)
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [selectedTrack])

  const maxWindowWidth = Math.min(280, containerWidth - 40); 
  const pixelsPerMs = maxWindowWidth / 15000;

  const bars = useMemo(() => {
    if (!selectedTrack) return []
    const totalWidth = selectedTrack.duration_ms * pixelsPerMs;
    const count = Math.max(20, Math.floor(totalWidth / 3)); // Dense bars for IG style
    const arr = []
    for (let i = 0; i < count; i++) {
      // Create a nice looking wave using a mix of sine and noise
      const base = Math.sin(i * 0.1) * 20 + 40;
      arr.push(base + Math.random() * 40)
    }
    return arr
  }, [selectedTrack, pixelsPerMs])

  const dragState = useRef<{
    type: 'left' | 'right' | 'center' | null, 
    startX: number, 
    initialDuration: number, 
    initialStart: number,
    pointerId: number,
    target: HTMLElement | null
  }>({
    type: null, startX: 0, initialDuration: 0, initialStart: 0, pointerId: 0, target: null
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: 'left' | 'right' | 'center') => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    dragState.current = { 
      type, 
      startX: e.clientX, 
      initialDuration: fragmentDurationMs, 
      initialStart: startTimeMs,
      pointerId: e.pointerId,
      target: e.currentTarget
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!dragState.current.type || !selectedTrack) return;
    
    const { type, startX, initialDuration, initialStart } = dragState.current;
    const deltaX = e.clientX - startX;
    const deltaMs = deltaX / pixelsPerMs;
    
    const minDur = 1000;
    const maxDur = Math.min(15000, maxDurationMs); 

    if (type === 'right') {
      let newDuration = initialDuration + deltaMs;
      newDuration = Math.max(minDur, Math.min(maxDur, newDuration));
      if (initialStart + newDuration > selectedTrack.duration_ms) {
        newDuration = selectedTrack.duration_ms - initialStart;
      }
      setFragmentDurationMs(newDuration);
    } 
    else if (type === 'left') {
      let newStart = initialStart + deltaMs;
      let newDuration = initialDuration - deltaMs;
      
      if (newDuration < minDur) {
        newStart = initialStart + initialDuration - minDur;
        newDuration = minDur;
      }
      if (newDuration > maxDur) {
        newStart = initialStart + initialDuration - maxDur;
        newDuration = maxDur;
      }
      if (newStart < 0) {
        newStart = 0;
        newDuration = initialStart + initialDuration;
      }
      setFragmentDurationMs(newDuration);
      setStartTimeMs(newStart);
    }
    else if (type === 'center') {
      let newStart = initialStart + deltaMs;
      if (newStart < 0) newStart = 0;
      if (newStart + initialDuration > selectedTrack.duration_ms) {
        newStart = selectedTrack.duration_ms - initialDuration;
      }
      setStartTimeMs(newStart);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (dragState.current.type && dragState.current.target) {
      try {
        dragState.current.target.releasePointerCapture(dragState.current.pointerId);
      } catch (err) {}
      dragState.current.type = null;
      dragState.current.target = null;
      if (audioRef.current && playingId === selectedTrack?.id) {
        audioRef.current.currentTime = startTimeMs / 1000;
      }
    }
  };

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

  // Auto-scroll so the selected fragment is visible when start time changes
  useEffect(() => {
    if (scrollRef.current && !dragState.current.type) {
      // scroll to keep the selection in view
      const targetScroll = (startTimeMs * pixelsPerMs) - (containerWidth / 2) + ((fragmentDurationMs * pixelsPerMs)/2);
      scrollRef.current.scrollLeft = Math.max(0, targetScroll);
    }
  }, [startTimeMs, pixelsPerMs, containerWidth, fragmentDurationMs]);

  const handlePlayPause = (track: MusicTrack) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.audio_url)
    }

    const audio = audioRef.current

    if (playingId === track.id && isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (playingId !== track.id) {
        audio.src = track.audio_url
      }
      
      if (selectedTrack && track.id === selectedTrack.id) {
        audio.currentTime = startTimeMs / 1000;
        audio.volume = volume;
      }
      
      audio.play().then(() => {
        setPlayingId(track.id);
        setIsPlaying(true);
        if (playingId !== track.id && track.id !== selectedTrack?.id) {
           setSelectedTrack(track);
           setStartTimeMs(0);
           setFragmentDurationMs(Math.min(15000, maxDurationMs, track.duration_ms));
        }
      }).catch(e => {
        console.error("Audio play failed:", e);
      })
    }
  }

  // Audio time update logic to keep it within the fragment
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying || !selectedTrack) return;

    const onTimeUpdate = () => {
      const endSecs = (startTimeMs + fragmentDurationMs) / 1000;
      if (audio.currentTime >= endSecs) {
        audio.currentTime = startTimeMs / 1000; // loop the fragment
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [isPlaying, selectedTrack, startTimeMs, fragmentDurationMs]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleDurationBlur = () => {
    let d = parseInt(durationInput)
    if (isNaN(d)) d = 5;
    d = Math.max(1, Math.min(Math.floor(maxDurationMs/1000), 15, d));
    const newDurMs = d * 1000;
    const finalDurMs = Math.min(newDurMs, (selectedTrack?.duration_ms || newDurMs) - startTimeMs);
    setFragmentDurationMs(finalDurMs);
    setDurationInput(Math.round(finalDurMs/1000).toString());
  }

  const handleConfirm = () => {
    if (!selectedTrack) return;
    
    let actualDuration = fragmentDurationMs;
    if (startTimeMs + actualDuration > selectedTrack.duration_ms) {
      actualDuration = selectedTrack.duration_ms - startTimeMs;
    }

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

  const handleClose = () => {
    if (videoRef?.current) {
      videoRef.current.volume = initialConfig?.original_audio_volume ?? 1;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      
      <div 
        ref={containerRef}
        className="bg-background w-full max-w-md h-[80vh] sm:h-[600px] rounded-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative" 
        onClick={e => e.stopPropagation()}
      >
        {!selectedTrack ? (
          <>
            <div className="p-4 border-b border-border flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-orange-500" /> Buscar música
                </h3>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(); }} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar canciones o artistas..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" /></div>
              ) : filteredTracks.length > 0 ? (
                <div className="space-y-1">
                  {filteredTracks.map(track => (
                    <div 
                      key={track.id} 
                      className="w-full flex items-center p-2 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedTrack(track);
                        setStartTimeMs(0);
                        setFragmentDurationMs(Math.min(15000, maxDurationMs, track.duration_ms));
                        handlePlayPause(track);
                      }}
                    >
                      <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Music className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePlayPause(track); }} 
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {playingId === track.id && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0 px-3 flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate">{track.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{track.artist}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(track.duration_ms)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground text-sm">No se encontraron canciones</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedTrack(null)
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }} 
                  className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">Elegir fragmento</h3>
              </div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(); }} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
              
              <div className="bg-muted px-4 py-2 rounded-xl mb-4 flex items-center text-orange-500">
                <span className="font-medium text-sm mr-2">Duración:</span>
                <input 
                  type="number"
                  value={durationInput}
                  onChange={e => setDurationInput(e.target.value)}
                  onBlur={handleDurationBlur}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  disabled={isVideo}
                  className="w-8 bg-transparent text-right font-bold text-sm outline-none appearance-none p-0 focus:border-b border-orange-500"
                  style={{ MozAppearance: 'textfield' }}
                />
                <span className="font-bold text-sm ml-0.5">s</span>
              </div>
              
              <div className="text-center mb-8 w-full px-4">
                <div className="text-xl font-bold text-foreground mb-1 line-clamp-1">{selectedTrack.title}</div>
                <div className="text-muted-foreground text-sm line-clamp-1">{selectedTrack.artist}</div>
                <div className="text-muted-foreground text-xs font-medium mt-2 flex items-center justify-center gap-1.5 bg-muted/50 w-fit mx-auto px-3 py-1 rounded-full">
                  <span>Fragmento: {formatTime(startTimeMs)} &mdash; {formatTime(startTimeMs + fragmentDurationMs)}</span>
                  <span>&middot;</span>
                  <span>Canción: {formatTime(selectedTrack.duration_ms)}</span>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="relative w-full flex flex-col items-center select-none mb-8">
                
                <div 
                  ref={scrollRef}
                  className="w-full overflow-x-auto no-scrollbar relative h-20 flex items-center touch-pan-x"
                >
                  <div 
                    className="relative h-full flex items-center flex-shrink-0" 
                    style={{ width: selectedTrack.duration_ms * pixelsPerMs + containerWidth }}
                  >
                    {/* Left padding to allow full scroll */}
                    <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
                    
                    {/* Track Waveform */}
                    <div className="relative h-10 flex items-center gap-[1px]" style={{ width: selectedTrack.duration_ms * pixelsPerMs }}>
                      {bars.map((h, i) => (
                        <div key={i} className="flex-1 bg-foreground/30 rounded-full" style={{ height: `${h}%` }} />
                      ))}

                      {/* The Orange Selection Bar */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 border-x-[3px] border-y-[2.5px] border-orange-500 bg-orange-500/10 shadow-sm touch-none cursor-grab active:cursor-grabbing rounded-[4px] z-10"
                        style={{ left: startTimeMs * pixelsPerMs, width: fragmentDurationMs * pixelsPerMs, height: 'calc(100% + 12px)' }}
                        onPointerDown={(e) => handlePointerDown(e, 'center')}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                      >
                        {/* Left Handle */}
                        <div 
                          className="absolute left-[-24px] top-[-10px] bottom-[-10px] w-[48px] flex items-center justify-center cursor-ew-resize touch-none group z-20"
                          onPointerDown={(e) => handlePointerDown(e, 'left')}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                        >
                          <div className="w-[5px] h-6 bg-white border border-orange-500 rounded-full shadow-sm group-hover:bg-orange-100 transition-colors pointer-events-none" />
                        </div>
                        
                        {/* Right Handle */}
                        <div 
                          className="absolute right-[-24px] top-[-10px] bottom-[-10px] w-[48px] flex items-center justify-center cursor-ew-resize touch-none group z-20"
                          onPointerDown={(e) => handlePointerDown(e, 'right')}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                        >
                          <div className="w-[5px] h-6 bg-white border border-orange-500 rounded-full shadow-sm group-hover:bg-orange-100 transition-colors pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Right padding */}
                    <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
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
                      onChange={e => {
                        const v = parseInt(e.target.value) / 100;
                        setOriginalVolume(v);
                        if (videoRef?.current) {
                          videoRef.current.volume = v;
                        }
                      }}
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
