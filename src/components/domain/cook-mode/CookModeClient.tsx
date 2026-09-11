"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, Check, Play, Pause, RotateCcw, Volume2, X, Maximize, Mic, MicOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { calculateLayer, calculateRealBrothRatio } from "@/lib/paella-calculator"
import { useRouter } from "next/navigation"
import { useVoiceCommands, type VoiceState } from "./useVoiceCommands"

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

export function CookModeClient({ recipe, userName, reset }: { recipe: CookModeRecipe, userName?: string | null, reset?: boolean }) {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Timer state per step
  const [timers, setTimers] = useState<Record<number, TimerState>>({})
  const [wakeLock, setWakeLock] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const hasWelcomed = useRef(false)

  // Recovery on mount
  useEffect(() => {
    setIsClient(true)
    if (reset) {
      localStorage.removeItem(`cook-mode-${recipe.id}`)
      return
    }
    const saved = localStorage.getItem(`cook-mode-${recipe.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.requested_servings === recipe.requested_servings) {
          if (parsed.currentStepIndex >= recipe.steps.length) {
            // They finished it last time. Start fresh.
            setCurrentStepIndex(0)
            setHasStarted(false)
          } else {
            setHasStarted(parsed.hasStarted || false)
            setCurrentStepIndex(parsed.currentStepIndex || 0)
          }
          
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
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)
  const isSpeakingRef = useRef<boolean>(false)

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      // If speech synthesis is already speaking something, cancel it before starting new speech
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }

      // Resume speech synthesis in case the browser paused it in the background
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 0.85
      utterance.pitch = 1

      let hasFinished = false
      const finishSpeech = (reason?: string) => {
        if (hasFinished) return
        hasFinished = true
        isSpeakingRef.current = false
        resolve()
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true
      }

      utterance.onend = (e) => {
        finishSpeech("onend")
      }

      utterance.onerror = (e) => {
        finishSpeech("onerror")
      }

      currentUtterance.current = utterance

      // Brief delay after cancel() ensures Chromium's speech engine clears without dropping the new utterance
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
          }
          window.speechSynthesis.speak(utterance)
        } catch (err) {
          console.error("[TTS] speak exception", err)
          finishSpeech("exception")
        }
      }, 50)
    })
  }

  // Cooking start state (user must press play manually on Step 1)
  const [cookingStartedByUser, setCookingStartedByUser] = useState(false)
  const cookingStartedByUserRef = useRef(cookingStartedByUser)
  useEffect(() => {
    cookingStartedByUserRef.current = cookingStartedByUser
  }, [cookingStartedByUser])

  const lastSpokenStepIndex = useRef<number>(-1)
  const currentStepIndexRef = useRef(currentStepIndex)
  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex
  }, [currentStepIndex])

  // Auto-advance mode
  const [autoAdvance, setAutoAdvance] = useState(false)
  const autoAdvanceRef = useRef(autoAdvance)
  const toggleAutoAdvance = () => {
    setAutoAdvance(prev => {
      const next = !prev
      autoAdvanceRef.current = next
      return next
    })
  }
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance
  }, [autoAdvance])

  // Flag to avoid double triggering step-end processing for the same step
  const completedStepsProcessed = useRef<Record<number, boolean>>({})

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
    // Only pressing Play on Step 1 enables the cookingStartedByUser flag
    if (stepIndex === 0) {
      setCookingStartedByUser(true)
    }

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

  // Voice Control Integration (Hooks must remain top-level unconditionally)
  const [pendingVoiceFinish, setPendingVoiceFinish] = useState(false)

  const voiceHandlers = useMemo(() => ({
    onNext: () => {
      handleNext()
    },
    onPrev: () => {
      handlePrev()
    },
    onRepeat: () => {
      const stepToRepeat = recipe.steps[currentStepIndex]
      if (stepToRepeat?.instruction) {
        let text = stepToRepeat.instruction
        if (stepToRepeat.duration_minutes) {
          text += `. Tiempo estimado: ${stepToRepeat.duration_minutes} minuto${stepToRepeat.duration_minutes !== 1 ? 's' : ''}.`
        }
        speakText(text)
      }
    },
    onPause: () => {
      setTimers(prev => {
        const t = prev[currentStepIndex]
        if (t && t.isRunning) {
          return { ...prev, [currentStepIndex]: { ...t, isRunning: false, endTime: null } }
        }
        return prev
      })
    },
    onResume: () => {
      const curStep = recipe.steps[currentStepIndex]
      const dur = curStep?.duration_minutes || 0
      toggleTimer(currentStepIndex, dur)
    },
    onWhatLeft: () => {
      const t = timers[currentStepIndex]
      const stepDur = recipe.steps[currentStepIndex]?.duration_minutes
      const remainingMs = t ? t.remainingMs : (stepDur ? stepDur * 60 * 1000 : 0)
      if (remainingMs <= 0) {
        speakText("El tiempo ha terminado o este paso no tiene temporizador.")
      } else {
        const totalSeconds = Math.ceil(remainingMs / 1000)
        const mins = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        let speech = "Quedan "
        if (mins > 0) {
          speech += `${mins} minuto${mins !== 1 ? 's' : ''}`
          if (secs > 0) speech += ` y ${secs} segundo${secs !== 1 ? 's' : ''}`
        } else {
          speech += `${secs} segundo${secs !== 1 ? 's' : ''}`
        }
        speakText(speech)
      }
    },
    onSetTimer: (seconds: number) => {
      if (currentStepIndex === 0) {
        setCookingStartedByUser(true)
      }
      setTimers(prev => ({
        ...prev,
        [currentStepIndex]: {
          isRunning: true,
          remainingMs: seconds * 1000,
          endTime: Date.now() + seconds * 1000,
        }
      }))
    },
    onFinishRequest: () => {
      setPendingVoiceFinish(true)
      speakText("¿Seguro que deseas terminar? Di sí o no.")
    },
    onConfirmFinish: () => {
      setPendingVoiceFinish(false)
      handleEndCook()
    },
    onCancelFinish: () => {
      setPendingVoiceFinish(false)
      speakText("De acuerdo, continuamos.")
    }
  }), [currentStepIndex, recipe.steps, timers]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    voiceEnabled,
    voiceState,
    feedbackMessage,
    isSupported: isVoiceSupported,
    toggleVoice
  } = useVoiceCommands({
    handlers: voiceHandlers,
    isTtsSpeakingRef: isSpeakingRef,
    pendingFinishConfirmation: pendingVoiceFinish
  })

  // Auto-TTS for steps entry & Step 1 reminder
  const currentStep = recipe.steps[currentStepIndex]

  useEffect(() => {
    if (!isClient || !hasStarted || !currentStep) return

    let isMounted = true

    // When entering a new step, speak instruction ONLY (never notes)
    if (lastSpokenStepIndex.current !== currentStepIndex) {
      lastSpokenStepIndex.current = currentStepIndex

      let entranceText = ""
      if (!hasWelcomed.current) {
        const nameGreeting = userName ? `${userName}, ` : ''
        entranceText = `¡Bienvenido! ${nameGreeting}Vamos a cocinar ${recipe.name}. ¡Preparado? ¡Empezamos! `
        hasWelcomed.current = true
      }

      if (currentStep.instruction) {
        entranceText += currentStep.instruction
        if (currentStep.duration_minutes) {
          entranceText += `. Tiempo estimado: ${currentStep.duration_minutes} minuto${currentStep.duration_minutes !== 1 ? 's' : ''}.`
        }
      }

      if (entranceText) {
        speakText(entranceText).then(() => {
          if (!isMounted) return

          // Step 1: NEVER auto-start timer on entrance. User MUST press Play.
          // Step 2+: If cooking was started by user, autoAdvance is enabled and step has duration, auto-start timer after instruction finishes speaking.
          if (currentStepIndex > 0 && cookingStartedByUserRef.current && autoAdvanceRef.current && currentStep.duration_minutes) {
            setTimers(prev => {
              const t = prev[currentStepIndex]
              if (!t || (!t.isRunning && t.remainingMs > 0)) {
                const durationMs = currentStep.duration_minutes * 60 * 1000
                const rem = t ? t.remainingMs : durationMs
                return {
                  ...prev,
                  [currentStepIndex]: {
                    isRunning: true,
                    remainingMs: rem,
                    endTime: Date.now() + rem
                  }
                }
              }
              return prev
            })
          }
        })
      }
    }

    // Step 1 reminder interval: If on step 0 and cooking hasn't started, repeat instruction every 30 seconds
    let reminderInterval: NodeJS.Timeout | null = null
    if (currentStepIndex === 0 && !cookingStartedByUser) {
      reminderInterval = setInterval(() => {
        if (!cookingStartedByUserRef.current && currentStepIndexRef.current === 0) {
          let repeatText = currentStep.instruction || ""
          if (currentStep.duration_minutes) {
            repeatText += `. Tiempo estimado: ${currentStep.duration_minutes} minuto${currentStep.duration_minutes !== 1 ? 's' : ''}.`
          }
          if (repeatText) {
            speakText(repeatText)
          }
        }
      }, 30000)
    }

    return () => {
      isMounted = false
      if (reminderInterval) clearInterval(reminderInterval)
    }
  }, [currentStepIndex, currentStep, hasStarted, isClient, cookingStartedByUser, recipe.name, userName])

  // Preload next image
  useEffect(() => {
    if (isClient && currentStepIndex + 1 < recipe.steps.length) {
      const nextStep = recipe.steps[currentStepIndex + 1]
      if (nextStep?.media?.storage_path) {
        const img = new window.Image()
        img.src = `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${nextStep.media.storage_path}`
      }
    }
  }, [currentStepIndex, recipe.steps, isClient])

  // Timer Tick and completion handling
  const processingFinishedStep = useRef<Record<number, boolean>>({})

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setTimers(prev => {
        let changed = false
        const next = { ...prev }

        for (const key in next) {
          const numKey = Number(key)
          const t = next[numKey]
          if (t.isRunning && t.endTime) {
            const rem = t.endTime - now
            if (rem <= 0) {
              next[numKey] = { ...t, remainingMs: 0, isRunning: false, endTime: null }
              changed = true

              // Atomic trigger: only process this finished step ONCE
              if (!completedStepsProcessed.current[numKey] && !processingFinishedStep.current[numKey]) {
                completedStepsProcessed.current[numKey] = true
                processingFinishedStep.current[numKey] = true

                // Execute step completion sequence
                const runStepCompletion = async (stepIdx: number) => {
                  // 1. Vibration if supported
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    try {
                      navigator.vibrate([200, 100, 200])
                    } catch (_) {}
                  }

                  const stepObj = recipe.steps[stepIdx]

                  // 2. Read ONLY notes of the finished step (no beep, alarm, or prefix phrase)
                  if (stepObj?.notes && stepObj.notes.trim().length > 0) {
                    await speakText(stepObj.notes.trim())
                  }

                  // 3. Auto-advance logic: check live autoAdvanceRef.current immediately after speech
                  if (autoAdvanceRef.current) {
                    if (stepIdx + 1 < recipe.steps.length) {
                      setCurrentStepIndex(stepIdx + 1)
                    } else {
                      // Last step finished -> show final view
                      setCurrentStepIndex(recipe.steps.length)
                    }
                  }
                }

                runStepCompletion(numKey)
              }
            } else {
              next[numKey] = { ...t, remainingMs: rem }
              changed = true
            }
          }
        }
        return changed ? next : prev
      })
    }, 100)

    return () => clearInterval(interval)
  }, [recipe.steps])

  if (!isClient) return null

  const layer = (recipe.rice_qty && recipe.diameter_cm) ? calculateLayer(recipe.rice_qty, recipe.diameter_cm) : null
  const ratio = (recipe.rice_qty && recipe.stock_qty) ? calculateRealBrothRatio(recipe.rice_qty, recipe.stock_qty) : null





  // Top actions are now inlined to prevent unmounting on every render

  // Initial Summary View
  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col justify-center p-6 sm:p-10 animate-in fade-in duration-500 relative overflow-hidden">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center z-50">
        <Link href={`/recipes/${recipe.id}`} onClick={() => localStorage.removeItem(`cook-mode-${recipe.id}`)} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Cerrar modo cocina">
          <X className="w-8 h-8" aria-hidden="true" />
        </Link>
      </div>
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
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center z-50">
          <Link href={`/recipes/${recipe.id}`} onClick={() => localStorage.removeItem(`cook-mode-${recipe.id}`)} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Cerrar modo cocina">
            <X className="w-8 h-8" aria-hidden="true" />
          </Link>
        </div>
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
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center z-50">
        <Link href={`/recipes/${recipe.id}`} onClick={() => localStorage.removeItem(`cook-mode-${recipe.id}`)} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Cerrar modo cocina">
          <X className="w-8 h-8" aria-hidden="true" />
        </Link>
      </div>
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between shrink-0 relative">
        {/* Voice Control Toggle Button */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={toggleVoice}
            disabled={!isVoiceSupported}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${
              !isVoiceSupported
                ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                : voiceEnabled
                ? voiceState === "processing"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-white/10 border-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
            aria-label={voiceEnabled ? "Desactivar control por voz" : "Activar control por voz"}
            title={!isVoiceSupported ? "Control por voz no disponible en este navegador" : "Control por voz"}
          >
            {voiceEnabled ? (
              <>
                <span className={`w-2 h-2 rounded-full ${voiceState === "processing" ? "bg-amber-400" : "bg-emerald-400 animate-ping"}`} />
                <Mic className="w-3.5 h-3.5" />
                <span>{voiceState === "processing" ? "Procesando..." : "Escuchando"}</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Voz: OFF</span>
              </>
            )}
          </button>
        </div>

        {/* Step indicator centered */}
        <div className="text-center font-black text-white/40 uppercase tracking-widest text-xs sm:text-sm">
          Paso {currentStepIndex + 1} de {recipe.steps.length}
        </div>

        {/* Spacer to balance the top bar layout */}
        <div className="w-24 sm:w-28" />
      </header>

      {/* Floating feedback message for voice commands */}
      {feedbackMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur border border-primary/40 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {feedbackMessage}
        </div>
      )}

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
                className="object-contain"
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
                    aria-label="Reiniciar temporizador"
                  >
                    <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={toggleAutoAdvance} 
                className={`w-full py-2.5 mt-1 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${autoAdvance ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-black/20 text-white/60 border border-white/5 hover:bg-black/40'}`}
              >
                {autoAdvance ? '✅ Avance automático activado' : '⚪ Avance automático desactivado'}
              </button>
            </div>
          )}

          {step.notes && (
            <div className={`mt-2 p-4 rounded-2xl border ${timer?.remainingMs === 0 ? 'bg-primary/20 border-primary/50 text-primary animate-pulse' : 'bg-white/5 border-white/10 text-white/80'} text-center md:text-lg font-medium leading-relaxed`}>
              {step.notes}
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

      {/* Confirmation Dialog for Terminar command */}
      {pendingVoiceFinish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-serif">¿Terminar cocinado?</h3>
              <p className="text-sm text-muted-foreground">
                Di <span className="font-bold text-foreground">"sí"</span> para confirmar o <span className="font-bold text-foreground">"no"</span> para continuar cocinando.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setPendingVoiceFinish(false)
                  speakText("De acuerdo, continuamos.")
                }}
                className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                No / Continuar
              </button>
              <button
                onClick={() => {
                  setPendingVoiceFinish(false)
                  handleEndCook()
                }}
                className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg"
              >
                Sí / Terminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
