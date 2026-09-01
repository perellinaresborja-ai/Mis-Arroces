"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Check, Play, Pause, RotateCcw, Volume2, X, Maximize } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { calculateLayer, calculateRealBrothRatio } from "@/lib/paella-calculator"
import { useRouter } from "next/navigation"

interface CookModeRecipe {
  id: string
  name: string
  base_servings: number | null
  requested_servings: number
  scale_ratio: number
  rice_qty: number | null
  stock_qty: number | null
  variety_name: string | null
  diameter_cm: number | null
  steps: any[]
}

interface TimerState {
  remainingMs: number
  endTime: number | null
  isRunning: boolean
}

export function CookModeClient({ recipe }: { recipe: CookModeRecipe }) {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Timer state per step
  const [timers, setTimers] = useState<Record<number, TimerState>>({})
  const [wakeLock, setWakeLock] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  // Recovery on mount
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem(`cook-mode-${recipe.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.requested_servings === recipe.requested_servings) {
          setHasStarted(parsed.hasStarted || false)
          setCurrentStepIndex(parsed.currentStepIndex || 0)
          
          // Reconcile timers (if end time is in the past, set to 0)
          const parsedTimers = parsed.timers || {}
          const now = Date.now()
          const restoredTimers: Record<number, TimerState> = {}
          for (const key in parsedTimers) {
            const numKey = Number(key);
            const t = parsedTimers[key]
            if (t.isRunning && t.endTime) {
              const remaining = t.endTime - now
              restoredTimers[numKey] = {
                ...t,
                remainingMs: remaining > 0 ? remaining : 0,
                isRunning: remaining > 0
              }
            } else {
              restoredTimers[numKey] = t
            }
          }
          setTimers(restoredTimers)
        }
      } catch (e) {
        console.error("Failed to restore cook mode state", e)
      }
    }
  }, [recipe.id, recipe.requested_servings])

  // Save state on change
  useEffect(() => {
    if (!isClient) return
    localStorage.setItem(`cook-mode-${recipe.id}`, JSON.stringify({
      hasStarted,
      currentStepIndex,
      requested_servings: recipe.requested_servings,
      timers
    }))
  }, [hasStarted, currentStepIndex, timers, recipe.id, recipe.requested_servings, isClient])

  // WakeLock management
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && hasStarted) {
      try {
        const lock = await (navigator as any).wakeLock.request('screen')
        setWakeLock(lock)
      } catch (err) {
        console.warn("WakeLock error:", err)
      }
    }
  }, [hasStarted])

  useEffect(() => {
    if (hasStarted) requestWakeLock()
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasStarted && wakeLock !== null) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLock) {
        wakeLock.release().catch(console.error)
      }
    }
  }, [hasStarted, requestWakeLock]) // eslint-disable-line react-hooks/exhaustive-deps

  // TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // clear queue
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 0.85 // Slower
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // Auto-TTS for steps
  useEffect(() => {
    if (isClient && hasStarted && currentStepIndex < recipe.steps.length) {
      const step = recipe.steps[currentStepIndex]
      if (step?.instruction) {
        let text = step.instruction;
        if (step.duration_minutes) {
          text += `. Tiempo estimado: ${step.duration_minutes} minuto${step.duration_minutes !== 1 ? 's' : ''}.`
        }
        speakText(text)
      }
    }
  }, [currentStepIndex, hasStarted, recipe.steps, isClient])

  // Preload next image
  useEffect(() => {
    if (isClient && currentStepIndex + 1 < recipe.steps.length) {
      const nextStep = recipe.steps[currentStepIndex + 1];
      if (nextStep?.media?.storage_path) {
        const img = new window.Image();
        img.src = `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${nextStep.media.storage_path}`;
      }
    }
  }, [currentStepIndex, recipe.steps, isClient])

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        let changed = false
        const next = { ...prev }
        const now = Date.now()
        
        for (const key in next) {
          const numKey = Number(key);
          const t = next[numKey]
          if (t.isRunning && t.endTime) {
            const rem = t.endTime - now
            if (rem <= 0) {
              next[numKey] = { ...t, remainingMs: 0, isRunning: false, endTime: null }
              changed = true
              // Play sound/vibrate
              if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
              // Play a simple beep
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                osc.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + 0.5)
              } catch(e) {}
            } else {
              next[numKey] = { ...t, remainingMs: rem }
              changed = true
            }
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isClient) return null

  const layer = (recipe.rice_qty && recipe.diameter_cm) ? calculateLayer(recipe.rice_qty, recipe.diameter_cm) : null
  const ratio = (recipe.rice_qty && recipe.stock_qty) ? calculateRealBrothRatio(recipe.rice_qty, recipe.stock_qty) : null

  const handleStart = () => setHasStarted(true)
  
  const handleNext = () => {
    if (currentStepIndex < recipe.steps.length) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }
  
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleEndCook = () => {
    localStorage.removeItem(`cook-mode-${recipe.id}`)
    router.push(`/recipes/${recipe.id}/cook?servings=${recipe.requested_servings}`)
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const toggleTimer = (stepIndex: number, durationMinutes: number) => {
    setTimers(prev => {
      const t = prev[stepIndex]
      const now = Date.now()
      
      if (!t) {
        // Start fresh
        const durationMs = durationMinutes * 60 * 1000
        return { ...prev, [stepIndex]: { isRunning: true, remainingMs: durationMs, endTime: now + durationMs } }
      }
      
      if (t.isRunning) {
        // Pause
        return { ...prev, [stepIndex]: { ...t, isRunning: false, endTime: null } }
      } else {
        // Resume
        if (t.remainingMs <= 0) return prev // already done
        return { ...prev, [stepIndex]: { ...t, isRunning: true, endTime: now + t.remainingMs } }
      }
    })
  }

  const resetTimer = (stepIndex: number, durationMinutes: number) => {
    setTimers(prev => ({
      ...prev,
      [stepIndex]: { isRunning: false, remainingMs: durationMinutes * 60 * 1000, endTime: null }
    }))
  }

  const TopActions = () => {
    return (
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center z-50">
        <Link href={`/recipes/${recipe.id}`} onClick={() => localStorage.removeItem(`cook-mode-${recipe.id}`)} className="p-2 text-white/50 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </Link>
      </div>
    )
  }

  // Initial Summary View
  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col justify-center p-6 sm:p-10 animate-in fade-in duration-500 relative overflow-hidden">
        <TopActions />
        <div className="max-w-md mx-auto w-full flex flex-col gap-6 md:gap-8 justify-center">
          <div className="space-y-2 md:space-y-4 text-center">
            <h1 className="text-3xl md:text-4xl font-black font-serif leading-tight">{recipe.name}</h1>
            <p className="text-white/60 text-sm md:text-lg uppercase tracking-widest font-bold">Resumen</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white/10 p-4 md:p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="text-white/50 text-xs md:text-sm font-bold uppercase mb-1">Raciones</span>
              <span className="text-2xl md:text-3xl font-black">{recipe.requested_servings}</span>
            </div>
            {recipe.diameter_cm && (
              <div className="bg-white/10 p-4 md:p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-white/50 text-xs md:text-sm font-bold uppercase mb-1">Paella</span>
                <span className="text-2xl md:text-3xl font-black">{recipe.diameter_cm} cm</span>
              </div>
            )}
            {recipe.rice_qty && (
              <div className="bg-white/10 p-4 md:p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-white/50 text-xs md:text-sm font-bold uppercase mb-1">Arroz</span>
                <span className="text-xl md:text-2xl font-black">{Math.round(recipe.rice_qty)}g</span>
                {recipe.variety_name && <span className="text-[10px] md:text-xs text-white/60 mt-1">{recipe.variety_name}</span>}
              </div>
            )}
            {recipe.stock_qty && (
              <div className="bg-white/10 p-4 md:p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-white/50 text-xs md:text-sm font-bold uppercase mb-1">Caldo</span>
                <span className="text-xl md:text-2xl font-black">{Math.round(recipe.stock_qty)}ml</span>
                {ratio && <span className="text-[10px] md:text-xs text-white/60 mt-1">Ratio {ratio}:1</span>}
              </div>
            )}
            {layer && (
              <div className="bg-white/10 p-4 md:p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center col-span-2">
                <span className="text-white/50 text-xs md:text-sm font-bold uppercase mb-1">Capa estimada</span>
                <span className="text-xl md:text-2xl font-black">{layer}</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-5 md:py-6 mt-2 bg-primary text-white rounded-full font-black text-xl md:text-2xl hover:bg-primary/90 transition-transform active:scale-95 shadow-xl"
          >
            EMPEZAR
          </button>
        </div>
      </div>
    )
  }

  // Final View
  if (currentStepIndex >= recipe.steps.length) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        <TopActions />
        <div className="max-w-md text-center flex flex-col gap-8 md:gap-12 w-full">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-black font-serif text-primary leading-tight">¡Arroz terminado!</h1>
            <p className="text-lg md:text-xl text-white/70">Es hora de disfrutar del socarrat.</p>
          </div>
          
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={handleEndCook}
              className="w-full py-5 md:py-6 bg-primary text-white rounded-3xl font-black text-xl md:text-2xl hover:bg-primary/90 transition-transform active:scale-95 shadow-xl"
            >
              REGISTRAR RESULTADO
            </button>
            
            <button 
              onClick={() => setCurrentStepIndex(recipe.steps.length - 1)}
              className="w-full py-3 text-white/50 hover:text-white transition-colors uppercase font-bold text-sm"
            >
              Volver al último paso
            </button>
          </div>
        </div>
      </div>
    )
  }

  const step = recipe.steps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  
  // Timer for current step
  const timer = timers[currentStepIndex]
  const hasDuration = step.duration_minutes && step.duration_minutes > 0
  const durationMs = hasDuration ? step.duration_minutes * 60 * 1000 : 0
  const displayTime = timer ? timer.remainingMs : durationMs

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col animate-in fade-in duration-300 select-none relative overflow-hidden">
      <TopActions />
      {/* Header */}
      <header className="p-6 flex items-center justify-center shrink-0">
        <div className="text-center font-black text-white/40 uppercase tracking-widest text-sm mt-2 md:mt-0">
          Paso {currentStepIndex + 1} de {recipe.steps.length}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-2 overflow-hidden min-h-0">
        <div key={currentStepIndex} className="w-full max-w-md mx-auto flex flex-col h-full animate-in fade-in duration-300">
          
          {/* Step Image / Fallback Logo */}
          <div className="w-full flex-1 min-h-[150px] max-h-[35vh] bg-white/5 rounded-3xl overflow-hidden mb-6 relative flex items-center justify-center border border-white/10 shadow-2xl shrink-0">
            {step.media?.storage_path ? (
              <Image 
                src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${step.media.storage_path}`}
                alt={`Paso ${currentStepIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <Image 
                src="/logofon.png" 
                alt="Mis Arroces" 
                width={120} 
                height={120} 
                className="opacity-40 grayscale"
              />
            )}
          </div>

          <div className="flex flex-col gap-6 shrink-0 justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-center">
              {step.instruction}
            </h2>

            {/* Timer Display */}
            {hasDuration && (
            <div className="bg-white/10 border border-white/20 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 shadow-2xl">
              <div className={`text-6xl md:text-7xl font-black font-mono tracking-tighter tabular-nums leading-none ${timer?.isRunning ? 'text-primary' : 'text-white'}`}>
                {formatTime(displayTime)}
              </div>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => toggleTimer(currentStepIndex, step.duration_minutes)}
                  className="flex-1 py-4 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-transform"
                >
                  {timer?.isRunning ? (
                    <><Pause className="w-5 h-5 fill-current"/> PAUSAR</>
                  ) : (
                    <><Play className="w-5 h-5 fill-current"/> {timer?.remainingMs < durationMs ? "CONTINUAR" : "INICIAR"}</>
                  )}
                </button>
                {timer && timer.remainingMs < durationMs && (
                  <button 
                    onClick={() => resetTimer(currentStepIndex, step.duration_minutes)}
                    className="w-16 py-4 rounded-2xl bg-white/20 text-white flex items-center justify-center hover:bg-white/30 active:scale-95 transition-transform shrink-0"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>

      {/* Bottom Navigation */}
      <footer className="p-6 grid grid-cols-2 gap-4 shrink-0 bg-gradient-to-t from-black to-transparent pb-8">
        <button 
          onClick={handlePrev}
          disabled={isFirst}
          className="w-full py-6 rounded-3xl bg-white/10 font-black text-xl hover:bg-white/20 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-8 h-8" />
          ANTERIOR
        </button>
        
        <button 
          onClick={handleNext}
          className="w-full py-6 rounded-3xl bg-primary text-white font-black text-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(var(--primary),0.4)]"
        >
          HECHO
          <ChevronRight className="w-8 h-8" />
        </button>
      </footer>
    </div>
  )
}
