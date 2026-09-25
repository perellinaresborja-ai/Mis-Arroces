"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Music, Play, Pause, Search, X, Volume2, ArrowLeft, Video, Check, Trash2 } from 'lucide-react'
import { getMusicCatalog } from '@/app/actions/stories'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audio_url: string
  duration_ms: number
  cover_url?: string
  category?: string
}

export interface StoryMusicSelectorProps {
  onSelect: (config: any) => void
  onClose: () => void
  maxDurationMs: number
  isVideo?: boolean
  initialConfig?: any
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

// Generate realistic deterministic waveform bars for the entire track
function generateTrackWaveformBars(seedStr: string, totalBars: number): number[] {
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  const bars: number[] = []
  for (let i = 0; i < totalBars; i++) {
    const pseudo1 = Math.abs(Math.sin((hash + i * 997) * 0.15))
    const pseudo2 = Math.abs(Math.cos((hash + i * 313) * 0.25))
    const pseudo3 = Math.abs(Math.sin((hash + i * 47) * 0.4))
    const height = Math.round(18 + (pseudo1 * 0.45 + pseudo2 * 0.35 + pseudo3 * 0.2) * 78)
    bars.push(height)
  }
  return bars
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const PX_PER_SEC = 16
const PX_PER_MS = PX_PER_SEC / 1000

export function StoryMusicSelector({
  onSelect,
  onClose,
  maxDurationMs,
  isVideo = false,
  initialConfig,
  videoRef
}: StoryMusicSelectorProps) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")

  // Selected track state
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(initialConfig?._trackMeta || null)

  // Bounds
  const effectiveMaxDurMs = Math.max(3000, Math.min(15000, maxDurationMs || 15000))
  const minDurMs = 3000

  // Selection interval state: selectionStartMs and selectionEndMs
  const [selectionStartMs, setSelectionStartMs] = useState<number>(initialConfig?.start_time_ms || 0)
  const [selectionEndMs, setSelectionEndMs] = useState<number>(() => {
    const start = initialConfig?.start_time_ms || 0
    const dur = initialConfig?.duration_ms
      ? Math.max(minDurMs, Math.min(effectiveMaxDurMs, initialConfig.duration_ms))
      : effectiveMaxDurMs
    return start + dur
  })

  const durationMs = Math.max(minDurMs, selectionEndMs - selectionStartMs)

  // Container measurement
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(360)

  // Active drag override for window bounds during handle resizing
  const [handleDragBounds, setHandleDragBounds] = useState<{
    leftPx: number
    rightPx: number
  } | null>(null)

  // Volumes
  const [volume, setVolume] = useState<number>(initialConfig?.music_volume ?? 1)
  const [originalVolume, setOriginalVolume] = useState<number>(initialConfig?.original_audio_volume ?? 1)

  // Audio Playback
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(initialConfig?._trackMeta?.id || null)
  const [currentPlaybackTimeMs, setCurrentPlaybackTimeMs] = useState<number>(selectionStartMs)

  // Drag state ref
  const dragRef = useRef<{
    active: 'tape' | 'handle-left' | 'handle-right' | null
    pointerStartX: number
    startMs: number
    endMs: number
    fixedStartMs: number
    fixedEndMs: number
    fixedWindowLeft: number
    fixedWindowRight: number
    trackDurMs: number
  }>({
    active: null,
    pointerStartX: 0,
    startMs: 0,
    endMs: 0,
    fixedStartMs: 0,
    fixedEndMs: 0,
    fixedWindowLeft: 0,
    fixedWindowRight: 0,
    trackDurMs: 180000
  })

  const isSeekingRef = useRef<boolean>(false)

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        if (w > 0) setContainerWidth(w)
      }
    }
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [selectedTrack])

  // Load catalog on mount
  useEffect(() => {
    let isMounted = true
    getMusicCatalog().then((data: MusicTrack[]) => {
      if (!isMounted) return
      setTracks(data || [])
      setLoading(false)

      if (initialConfig?.track_id && !initialConfig?._trackMeta) {
        const found = (data || []).find(t => t.id === initialConfig.track_id)
        if (found) {
          setSelectedTrack(found)
          setPreviewTrackId(found.id)
        }
      }
    }).catch(err => {
      console.error("Error loading music catalog:", err)
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [initialConfig])

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    tracks.forEach(t => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim())
      }
    })
    return ['Todos', ...Array.from(set)]
  }, [tracks])

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tracks.filter(t => {
      const matchSearch = !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      const matchCategory = selectedCategory === 'Todos' || t.category?.trim().toLowerCase() === selectedCategory.toLowerCase()
      return matchSearch && matchCategory
    })
  }, [tracks, search, selectedCategory])

  // Waveform SVG data for selected track
  const waveformSvgData = useMemo(() => {
    if (!selectedTrack) return { barsPath: '', totalWidth: 0, timestamps: [] }
    const trackDurSec = Math.max(10, Math.ceil(selectedTrack.duration_ms / 1000))
    const totalBars = trackDurSec * 4
    const bars = generateTrackWaveformBars(selectedTrack.id + selectedTrack.title, totalBars)
    const totalWidth = trackDurSec * PX_PER_SEC

    const barW = 2.5
    const barGap = 4
    const maxH = 44

    let d = ''
    for (let i = 0; i < bars.length; i++) {
      const x = i * barGap + 1
      const h = Math.max(4, (bars[i] / 100) * maxH)
      const y = (maxH - h) / 2
      d += `M${x},${y + 1} Q${x},${y} ${x + 1},${y} L${x + barW - 1},${y} Q${x + barW},${y} ${x + barW},${y + 1} L${x + barW},${y + h - 1} Q${x + barW},${y + h} ${x + barW - 1},${y + h} L${x + 1},${y + h} Q${x},${y + h} ${x},${y + h - 1} Z `
    }

    const timestamps: { sec: number; x: number; label: string }[] = []
    for (let s = 0; s <= trackDurSec; s += 10) {
      timestamps.push({
        sec: s,
        x: s * PX_PER_SEC,
        label: formatTime(s * 1000)
      })
    }

    return { barsPath: d, totalWidth, timestamps }
  }, [selectedTrack])

  // Single audio instance management
  const getOrCreateAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.addEventListener('seeked', () => {
        isSeekingRef.current = false
      })
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  // Precise Loop & Live Playhead update using requestAnimationFrame
  useEffect(() => {
    let animId: number
    const tick = () => {
      const audio = audioRef.current
      if (audio && !audio.paused && !dragRef.current.active) {
        if (!audio.seeking && !isSeekingRef.current) {
          const curSec = audio.currentTime
          const curMs = curSec * 1000
          const startSec = selectionStartMs / 1000
          const endSec = selectionEndMs / 1000

          if (curSec >= startSec - 0.1 && curSec < endSec) {
            setCurrentPlaybackTimeMs(curMs)
          } else {
            // Reached end of fragment: loop seamlessly
            isSeekingRef.current = true
            audio.currentTime = startSec
            setCurrentPlaybackTimeMs(selectionStartMs)
            if (videoRef?.current) {
              videoRef.current.currentTime = 0
              videoRef.current.play().catch(() => {})
            }
            setTimeout(() => {
              isSeekingRef.current = false
            }, 150)
          }
        }
      }
      if (isPlaying) {
        animId = requestAnimationFrame(tick)
      }
    }

    if (isPlaying) {
      animId = requestAnimationFrame(tick)
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [isPlaying, selectionStartMs, selectionEndMs, videoRef])

  // Start preview of track fragment with simultaneous video playback
  const playPreview = useCallback((startMs: number) => {
    if (!selectedTrack) return
    const audio = getOrCreateAudio()
    audio.volume = volume

    if (audio.src !== selectedTrack.audio_url) {
      audio.src = selectedTrack.audio_url
    }

    isSeekingRef.current = true
    audio.currentTime = startMs / 1000
    audio.play().then(() => {
      setIsPlaying(true)
      setPreviewTrackId(selectedTrack.id)
      setCurrentPlaybackTimeMs(startMs)

      if (videoRef?.current) {
        videoRef.current.muted = originalVolume === 0
        videoRef.current.volume = originalVolume
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
      }
      setTimeout(() => {
        isSeekingRef.current = false
      }, 150)
    }).catch(err => {
      console.log("Audio play prevented:", err)
      setIsPlaying(false)
      isSeekingRef.current = false
    })
  }, [selectedTrack, getOrCreateAudio, volume, originalVolume, videoRef])

  // Safely seek audio and sync video
  const seekAudioTo = useCallback((targetStartMs: number) => {
    const audio = audioRef.current
    if (!audio || !selectedTrack) return

    isSeekingRef.current = true
    const targetSec = targetStartMs / 1000
    audio.currentTime = targetSec
    setCurrentPlaybackTimeMs(targetStartMs)

    if (isPlaying) {
      audio.play().catch(() => {})
      if (videoRef?.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
      }
    }

    setTimeout(() => {
      isSeekingRef.current = false
    }, 150)
  }, [selectedTrack, isPlaying, videoRef])

  // Stop preview
  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (videoRef?.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
  }, [videoRef])

  // Handler: Tap track row in catalog
  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track)
    const initialStart = 0
    const initialDur = Math.min(effectiveMaxDurMs, track.duration_ms)
    setSelectionStartMs(initialStart)
    setSelectionEndMs(initialStart + initialDur)
    setCurrentPlaybackTimeMs(initialStart)
    playPreview(initialStart)
  }

  // Handler: Toggle preview play/pause in catalog list
  const handleToggleCatalogPreview = (e: React.MouseEvent, track: MusicTrack) => {
    e.stopPropagation()
    const audio = getOrCreateAudio()

    if (previewTrackId === track.id && isPlaying) {
      stopPreview()
    } else {
      audio.volume = volume
      if (audio.src !== track.audio_url) audio.src = track.audio_url
      audio.currentTime = 0
      audio.play().then(() => {
        setIsPlaying(true)
        setPreviewTrackId(track.id)
      }).catch(() => setIsPlaying(false))
    }
  }

  // Handler: Toggle play/pause in adjust view
  const handleToggleFragmentPlayback = () => {
    if (!selectedTrack) return
    if (isPlaying) {
      stopPreview()
    } else {
      playPreview(selectionStartMs)
    }
  }

  // Handler: Nudge start time forward or backward
  const handleNudge = (deltaMs: number) => {
    if (!selectedTrack) return
    const trackDur = Math.max(1000, selectedTrack.duration_ms)
    const curDur = selectionEndMs - selectionStartMs
    const maxStart = Math.max(0, trackDur - curDur)

    const newStart = Math.max(0, Math.min(maxStart, selectionStartMs + deltaMs))
    const newEnd = newStart + curDur

    setSelectionStartMs(newStart)
    setSelectionEndMs(newEnd)
    seekAudioTo(newStart)
  }

  // Window positioning geometry
  const durationPx = durationMs * PX_PER_MS
  const defaultWindowLeft = Math.max(20, Math.round((containerWidth - durationPx) / 2))
  const defaultWindowRight = defaultWindowLeft + durationPx

  // Effective visual window bounds
  const currentWindowLeft = handleDragBounds ? handleDragBounds.leftPx : defaultWindowLeft
  const currentWindowRight = handleDragBounds ? handleDragBounds.rightPx : defaultWindowRight
  const currentWindowWidth = Math.max(minDurMs * PX_PER_MS, currentWindowRight - currentWindowLeft)

  // Waveform tape horizontal translation
  // Ensures selectionStartMs aligns perfectly with currentWindowLeft
  const tapeTranslateX = currentWindowLeft - (selectionStartMs * PX_PER_MS)

  // Pointer interaction: Start dragging tape or handles
  const handleStartDrag = (
    mode: 'tape' | 'handle-left' | 'handle-right',
    clientX: number,
    e: React.PointerEvent | React.TouchEvent
  ) => {
    if (!selectedTrack) return
    e.stopPropagation()

    const trackDurMs = Math.max(minDurMs, selectedTrack.duration_ms || 180000)

    dragRef.current = {
      active: mode,
      pointerStartX: clientX,
      startMs: selectionStartMs,
      endMs: selectionEndMs,
      fixedStartMs: selectionStartMs,
      fixedEndMs: selectionEndMs,
      fixedWindowLeft: currentWindowLeft,
      fixedWindowRight: currentWindowRight,
      trackDurMs
    }
  }

  // Global pointer listeners for smooth, uninterrupted drag
  useEffect(() => {
    const handleMove = (clientX: number) => {
      const drag = dragRef.current
      if (!drag.active || !selectedTrack) return

      const deltaX = clientX - drag.pointerStartX

      if (drag.active === 'tape') {
        // Sliding the song horizontally
        // Moving finger left (negative deltaX) advances the song into the future
        const deltaMs = -Math.round(deltaX / PX_PER_MS)
        const curDur = drag.endMs - drag.startMs
        const maxStart = Math.max(0, drag.trackDurMs - curDur)
        const newStart = Math.max(0, Math.min(maxStart, drag.startMs + deltaMs))
        const newEnd = newStart + curDur

        setSelectionStartMs(newStart)
        setSelectionEndMs(newEnd)
        setCurrentPlaybackTimeMs(newStart)
      } else if (drag.active === 'handle-left') {
        // Adjusting start time from the left handle
        // Moving left increases duration and advances start backward
        const maxDeltaLeft = drag.fixedWindowRight - (minDurMs * PX_PER_MS)
        const minDeltaLeft = Math.max(16, drag.fixedWindowRight - (effectiveMaxDurMs * PX_PER_MS))
        
        let newLeftPx = drag.fixedWindowLeft + deltaX
        newLeftPx = Math.max(minDeltaLeft, Math.min(maxDeltaLeft, newLeftPx))

        const newDurMs = Math.round((drag.fixedWindowRight - newLeftPx) / PX_PER_MS)
        const clampedDur = Math.max(minDurMs, Math.min(effectiveMaxDurMs, newDurMs))
        const newStart = Math.max(0, drag.fixedEndMs - clampedDur)

        setSelectionStartMs(newStart)
        setCurrentPlaybackTimeMs(newStart)
        setHandleDragBounds({
          leftPx: newLeftPx,
          rightPx: drag.fixedWindowRight
        })
      } else if (drag.active === 'handle-right') {
        // Adjusting end time from the right handle
        const minRightPx = drag.fixedWindowLeft + (minDurMs * PX_PER_MS)
        const maxAllowedDurMs = Math.min(effectiveMaxDurMs, drag.trackDurMs - drag.fixedStartMs)
        const maxRightPx = drag.fixedWindowLeft + (maxAllowedDurMs * PX_PER_MS)

        let newRightPx = drag.fixedWindowRight + deltaX
        newRightPx = Math.max(minRightPx, Math.min(maxRightPx, newRightPx))

        const newDurMs = Math.round((newRightPx - drag.fixedWindowLeft) / PX_PER_MS)
        const clampedDur = Math.max(minDurMs, Math.min(maxAllowedDurMs, newDurMs))
        const newEnd = drag.fixedStartMs + clampedDur

        setSelectionEndMs(newEnd)
        setHandleDragBounds({
          leftPx: drag.fixedWindowLeft,
          rightPx: newRightPx
        })
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (dragRef.current.active) {
        e.preventDefault()
        handleMove(e.clientX)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current.active) {
        if (e.cancelable) e.preventDefault()
        const touch = e.touches[0] || e.changedTouches[0]
        if (touch) {
          handleMove(touch.clientX)
        }
      }
    }

    const onEnd = () => {
      if (!dragRef.current.active) return
      const wasActive = dragRef.current.active
      dragRef.current.active = null
      setHandleDragBounds(null)

      if (audioRef.current && selectedTrack) {
        if (wasActive === 'tape' || wasActive === 'handle-left') {
          seekAudioTo(selectionStartMs)
        }
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [selectedTrack, effectiveMaxDurMs, minDurMs, selectionStartMs, seekAudioTo])

  // Playhead needle position
  const playheadProgress = useMemo(() => {
    if (!durationMs || durationMs <= 0) return 0
    const offset = currentPlaybackTimeMs - selectionStartMs
    return Math.max(0, Math.min(1, offset / durationMs))
  }, [currentPlaybackTimeMs, selectionStartMs, durationMs])

  const playheadPx = currentWindowLeft + playheadProgress * currentWindowWidth

  // Volume slider handlers
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, val))
    }
  }

  const handleOriginalVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100
    setOriginalVolume(val)
    if (videoRef?.current) {
      videoRef.current.muted = val === 0
      videoRef.current.volume = Math.max(0, Math.min(1, val))
      if (val > 0 && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }
  }

  // Close handler
  const handleClose = () => {
    stopPreview()
    if (videoRef?.current) {
      const vol = initialConfig?.original_audio_volume ?? 1
      videoRef.current.volume = vol
      videoRef.current.muted = vol === 0
    }
    onClose()
  }

  // Confirm selection
  const handleConfirm = () => {
    stopPreview()
    if (!selectedTrack) {
      onSelect(isVideo ? { original_audio_volume: originalVolume } : null)
      return
    }

    let actualDuration = durationMs
    if (selectionStartMs + actualDuration > selectedTrack.duration_ms) {
      actualDuration = Math.max(minDurMs, selectedTrack.duration_ms - selectionStartMs)
    }

    onSelect({
      track_id: selectedTrack.id,
      start_time_ms: selectionStartMs,
      duration_ms: actualDuration,
      music_volume: volume,
      original_audio_volume: isVideo ? originalVolume : undefined,
      _trackMeta: selectedTrack
    })
  }

  // Remove music
  const handleRemoveMusic = () => {
    stopPreview()
    onSelect(isVideo ? { original_audio_volume: originalVolume } : null)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-[2px] pointer-events-auto"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        style={{ maxHeight: selectedTrack ? (isVideo ? '60vh' : '55vh') : '62vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top drag pill */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* ---------------- STATE 1: SEARCH TRACKS ---------------- */}
        {!selectedTrack ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header & Search Bar */}
            <div className="px-4 py-2 border-b border-border/60 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Music className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Música para tu historia</span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar canciones o artistas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-muted/70 hover:bg-muted focus:bg-background rounded-xl outline-none text-xs text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Chips */}
              {categories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-xs">Cargando pistas...</span>
                </div>
              ) : filteredTracks.length > 0 ? (
                filteredTracks.map((track) => {
                  const isCurrentPlaying = previewTrackId === track.id && isPlaying
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`w-full flex items-center p-2 rounded-2xl hover:bg-muted/70 transition-colors cursor-pointer group border ${
                        previewTrackId === track.id ? 'bg-primary/5 border-primary/30' : 'border-transparent'
                      }`}
                    >
                      {/* Cover with Play/Pause button */}
                      <div className="w-11 h-11 bg-muted rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border border-border/50">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-5 h-5 text-muted-foreground" />
                        )}
                        <button
                          onClick={(e) => handleToggleCatalogPreview(e, track)}
                          className={`absolute inset-0 flex items-center justify-center transition-all ${
                            isCurrentPlaying
                              ? 'bg-primary/80 opacity-100 text-white'
                              : 'bg-black/40 opacity-0 group-hover:opacity-100 text-white'
                          }`}
                          title={isCurrentPlaying ? "Pausar" : "Escuchar"}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Title & Artist */}
                      <div className="flex-1 min-w-0 px-3 flex flex-col">
                        <span className={`text-xs font-bold truncate ${previewTrackId === track.id ? 'text-primary' : 'text-foreground'}`}>
                          {track.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {track.artist}
                        </span>
                      </div>

                      {/* Total Duration & Action indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {formatTime(track.duration_ms)}
                        </span>
                        <div className="px-2 py-1 rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Elegir
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No se encontraron canciones
                </div>
              )}
            </div>

            {/* When it's a video story, show Audio del vídeo control so user can adjust it even without music */}
            {isVideo && (
              <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3 shrink-0">
                <div className="flex-1 flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border/50">
                  <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Audio del vídeo</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(originalVolume * 100)}
                    onChange={handleOriginalVolumeChange}
                    className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                    {Math.round(originalVolume * 100)}%
                  </span>
                </div>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-2xl shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ---------------- STATE 2: INSTAGRAM-STYLE ADJUST FRAGMENT ---------------- */
          <div className="flex-1 flex flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
            {/* Top Bar: Back, Track Info, Close */}
            <div className="flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => {
                  stopPreview()
                  setSelectedTrack(null)
                }}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                title="Cambiar canción"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                <div className="w-7 h-7 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                  {selectedTrack.cover_url ? (
                    <img src={selectedTrack.cover_url} alt={selectedTrack.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 text-center">
                  <div className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                    {selectedTrack.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]">
                    {selectedTrack.artist}
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clear Time display: 0:42 — 0:54 | 12 s */}
            <div className="flex items-center justify-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleNudge(-5000)}
                className="px-2.5 py-1 rounded-xl bg-muted/80 hover:bg-muted active:scale-95 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border/50 transition-all cursor-pointer"
                title="Retroceder 5 segundos"
              >
                -5s
              </button>

              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 shadow-sm">
                <span className="font-mono text-xs font-bold text-foreground tracking-tight">
                  {formatTime(selectionStartMs)} — {formatTime(selectionEndMs)}
                </span>
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold font-mono">
                  {Math.round(durationMs / 1000)} s
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleNudge(5000)}
                className="px-2.5 py-1 rounded-xl bg-muted/80 hover:bg-muted active:scale-95 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border/50 transition-all cursor-pointer"
                title="Avanzar 5 segundos"
              >
                +5s
              </button>
            </div>

            {/* Instagram-style Reel Trimmer Container */}
            <div className="flex flex-col gap-1 shrink-0 px-1">
              <div
                ref={containerRef}
                className="relative w-full h-20 bg-muted/30 rounded-2xl overflow-hidden select-none border border-border/50 cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => handleStartDrag('tape', e.clientX, e)}
              >
                {/* Horizontal Waveform Tape (Moves smoothly with horizontal translation) */}
                <div
                  className="absolute top-0 bottom-0 flex flex-col justify-center pointer-events-none will-change-transform"
                  style={{
                    width: `${waveformSvgData.totalWidth}px`,
                    transform: `translateX(${tapeTranslateX}px)`
                  }}
                >
                  {/* Waveform Bars */}
                  <svg
                    width={waveformSvgData.totalWidth}
                    height={46}
                    className="overflow-visible"
                  >
                    <path
                      d={waveformSvgData.barsPath}
                      fill="currentColor"
                      className="text-foreground/35"
                    />
                  </svg>

                  {/* 10-Second Time Markers Along the Reel */}
                  <div className="relative w-full h-4 mt-0.5">
                    {waveformSvgData.timestamps.map((ts) => (
                      <div
                        key={ts.sec}
                        className="absolute top-0 flex flex-col items-center"
                        style={{ left: `${ts.x}px`, transform: 'translateX(-50%)' }}
                      >
                        <div className="w-[1px] h-1.5 bg-muted-foreground/40" />
                        <span className="text-[9px] font-mono text-muted-foreground/70 tracking-tighter">
                          {ts.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Left Shaded Curtain (Darkens waveform outside selection) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/40 backdrop-blur-[1px] pointer-events-none z-10 border-r border-primary/30"
                  style={{ width: `${currentWindowLeft}px` }}
                />

                {/* Right Shaded Curtain (Darkens waveform outside selection) */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/40 backdrop-blur-[1px] pointer-events-none z-10 border-l border-primary/30"
                  style={{ left: `${currentWindowRight}px` }}
                />

                {/* Selection Window Frame (Centered / Positioned over reel) */}
                <div
                  className="absolute top-1 bottom-1 rounded-xl border-2 border-primary bg-primary/10 shadow-sm pointer-events-none z-15"
                  style={{
                    left: `${currentWindowLeft}px`,
                    width: `${currentWindowWidth}px`
                  }}
                />

                {/* Playhead Needle (Sweeps within the selection window) */}
                {isPlaying && (
                  <div
                    className="absolute top-1 bottom-1 w-[2.5px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none z-25"
                    style={{ left: `${playheadPx}px` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow" />
                  </div>
                )}

                {/* Left Handle (Resize start time & duration) */}
                <div
                  className="absolute top-0 bottom-0 w-9 flex items-center justify-center cursor-ew-resize z-30 select-none group"
                  style={{
                    left: `${currentWindowLeft}px`,
                    transform: 'translateX(-50%)',
                    touchAction: 'none'
                  }}
                  onPointerDown={(e) => handleStartDrag('handle-left', e.clientX, e)}
                  title="Ajustar inicio"
                >
                  <div className="w-3 h-11 bg-white border-2 border-primary rounded-full shadow-lg group-hover:scale-110 active:scale-110 transition-transform pointer-events-none flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-primary/80 rounded-full" />
                  </div>
                </div>

                {/* Right Handle (Resize end time & duration) */}
                <div
                  className="absolute top-0 bottom-0 w-9 flex items-center justify-center cursor-ew-resize z-30 select-none group"
                  style={{
                    left: `${currentWindowRight}px`,
                    transform: 'translateX(-50%)',
                    touchAction: 'none'
                  }}
                  onPointerDown={(e) => handleStartDrag('handle-right', e.clientX, e)}
                  title="Ajustar final"
                >
                  <div className="w-3 h-11 bg-white border-2 border-primary rounded-full shadow-lg group-hover:scale-110 active:scale-110 transition-transform pointer-events-none flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-primary/80 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Helpful interaction hint */}
              <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground/70">
                <span>Desliza la canción para buscar el fragmento</span>
                <span>Tira de los extremos para ajustar duración</span>
              </div>
            </div>

            {/* Controls: Play/Pause button + Volume sliders */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFragmentPlayback}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
                  title={isPlaying ? "Pausar" : "Reproducir fragmento"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                {/* Music Volume */}
                <div className="flex-1 flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-2xl border border-border/40">
                  <Volume2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Música</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={handleVolumeChange}
                    className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Original Audio Volume (when video story) */}
              {isVideo && (
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-2xl border border-border/40">
                  <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Audio del vídeo</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(originalVolume * 100)}
                    onChange={handleOriginalVolumeChange}
                    className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                    {Math.round(originalVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions: Remove (if active) & Confirm */}
            <div className="flex items-center gap-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] shrink-0">
              {initialConfig && (
                <button
                  onClick={handleRemoveMusic}
                  className="px-4 py-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-destructive rounded-2xl font-bold text-xs border border-border/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Eliminar música de la historia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              )}

              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Listo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
