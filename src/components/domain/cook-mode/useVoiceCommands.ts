"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type VoiceState = "off" | "listening" | "processing" | "unsupported" | "error"

export interface VoiceCommandHandlers {
  onNext: () => void
  onPrev: () => void
  onRepeat: () => void
  onPause: () => void
  onResume: () => void
  onWhatLeft: () => void
  onSetTimer: (seconds: number) => void
  onFinishRequest: () => void
  onConfirmFinish: () => void
  onCancelFinish: () => void
}

// Convert Spanish words to numbers
function parseSpanishNumber(wordOrDigits: string): number | null {
  const trimmed = wordOrDigits.trim().toLowerCase()
  const num = parseInt(trimmed, 10)
  if (!isNaN(num)) return num

  const wordMap: Record<string, number> = {
    "un": 1,
    "uno": 1,
    "una": 1,
    "dos": 2,
    "tres": 3,
    "cuatro": 4,
    "cinco": 5,
    "seis": 6,
    "siete": 7,
    "ocho": 8,
    "nueve": 9,
    "diez": 10,
    "once": 11,
    "doce": 12,
    "trece": 13,
    "catorce": 14,
    "quince": 15,
    "dieciséis": 16,
    "dieciseis": 16,
    "diecisiete": 17,
    "dieciocho": 18,
    "diecinueve": 19,
    "veinte": 20,
    "veintiuno": 21,
    "veintidós": 22,
    "veintidos": 22,
    "veintitrés": 23,
    "veintitres": 23,
    "veinticuatro": 24,
    "veinticinco": 25,
    "veintiséis": 26,
    "veintiseis": 26,
    "veintisiete": 27,
    "veintiocho": 28,
    "veintinueve": 29,
    "treinta": 30,
    "cuarenta": 40,
    "cincuenta": 50,
  }

  if (wordMap[trimmed] !== undefined) {
    return wordMap[trimmed]
  }

  // Handle compound words like "treinta y cinco"
  if (trimmed.includes(" y ")) {
    const parts = trimmed.split(" y ")
    const tens = wordMap[parts[0]?.trim() || ""]
    const ones = wordMap[parts[1]?.trim() || ""]
    if (tens !== undefined && ones !== undefined) {
      return tens + ones
    }
  }

  return null
}

export function parseTimerCommand(transcript: string): number | null {
  const clean = transcript.toLowerCase().trim()
  
  // Regex for minutes: (temporizador|pon|ajusta)? (de)? (X) minuto(s)?
  const minMatch = clean.match(/(?:temporizador|pon|ajusta|cuenta)?\s*(?:de)?\s*([a-z0-9\s]+?)\s*minuto(?:s)?(?:\b|$)/i)
  if (minMatch && minMatch[1]) {
    const parsed = parseSpanishNumber(minMatch[1].trim())
    if (parsed !== null && parsed > 0 && parsed <= 120) {
      return parsed * 60
    }
  }

  // Regex for seconds: (temporizador|pon|ajusta)? (de)? (X) segundo(s)?
  const secMatch = clean.match(/(?:temporizador|pon|ajusta|cuenta)?\s*(?:de)?\s*([a-z0-9\s]+?)\s*segundo(?:s)?(?:\b|$)/i)
  if (secMatch && secMatch[1]) {
    const parsed = parseSpanishNumber(secMatch[1].trim())
    if (parsed !== null && parsed > 0 && parsed <= 3600) {
      return parsed
    }
  }

  return null
}

export function useVoiceCommands({
  handlers,
  isTtsSpeakingRef,
  pendingFinishConfirmation,
}: {
  handlers: VoiceCommandHandlers
  isTtsSpeakingRef: React.MutableRefObject<boolean>
  pendingFinishConfirmation: boolean
}) {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>("off")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean>(true)

  const recognitionRef = useRef<any>(null)
  const isManuallyStoppedRef = useRef<boolean>(true)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handlersRef = useRef(handlers)
  const pendingFinishRef = useRef(pendingFinishConfirmation)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    pendingFinishRef.current = pendingFinishConfirmation
  }, [pendingFinishConfirmation])

  const showFeedback = useCallback((msg: string, durationMs = 3000) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    setFeedbackMessage(msg)
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null)
    }, durationMs)
  }, [])

  // Check speech recognition support on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setVoiceState("unsupported")
      }
    }
  }, [])

  // Command parser
  const processTranscript = useCallback((rawTranscript: string) => {
    const text = rawTranscript.toLowerCase().trim()
    console.log("[VoiceControl] Received transcript:", text)

    // Check if in confirmation mode for finish
    if (pendingFinishRef.current) {
      if (text.includes("sí") || text.includes("si") || text.includes("confirmar") || text.includes("afirmativo") || text.includes("correcto")) {
        showFeedback("Confirmado: terminando", 2000)
        handlersRef.current.onConfirmFinish()
        return
      }
      if (text.includes("no") || text.includes("cancelar") || text.includes("espera") || text.includes("todavía no") || text.includes("seguir")) {
        showFeedback("Terminación cancelada", 2000)
        handlersRef.current.onCancelFinish()
        return
      }
      showFeedback("Por favor di 'sí' para confirmar o 'no' para continuar", 3000)
      return
    }

    // 1. TERMINAR (Must require confirmation)
    if (
      text.includes("terminar elaboración") ||
      text.includes("terminar") ||
      text.includes("finalizar")
    ) {
      showFeedback("¿Seguro que deseas terminar? Di 'sí' o 'no'", 4000)
      handlersRef.current.onFinishRequest()
      return
    }

    // 2. SIGUIENTE
    if (
      text.includes("siguiente paso") ||
      text.includes("siguiente") ||
      text.includes("continuar paso") ||
      text.includes("avanzar")
    ) {
      showFeedback("Siguiente paso", 1500)
      handlersRef.current.onNext()
      return
    }

    // 3. ANTERIOR
    if (
      text.includes("paso anterior") ||
      text.includes("anterior") ||
      text.includes("volver")
    ) {
      showFeedback("Paso anterior", 1500)
      handlersRef.current.onPrev()
      return
    }

    // 4. REPETIR
    if (
      text.includes("repite el paso") ||
      text.includes("repite") ||
      text.includes("repetir")
    ) {
      showFeedback("Repitiendo paso...", 1500)
      handlersRef.current.onRepeat()
      return
    }

    // 5. TIEMPO RESTANTE
    if (
      text.includes("cuánto queda") ||
      text.includes("cuanto queda") ||
      text.includes("cuánto tiempo queda") ||
      text.includes("cuanto tiempo queda") ||
      text.includes("tiempo restante")
    ) {
      handlersRef.current.onWhatLeft()
      return
    }

    // 6. PAUSA
    if (
      text.includes("pausa") ||
      text.includes("pausar") ||
      text.includes("para el temporizador") ||
      text.includes("para el timer")
    ) {
      showFeedback("Pausa", 1500)
      handlersRef.current.onPause()
      return
    }

    // 7. CONTINUAR
    if (
      text.includes("continúa") ||
      text.includes("continua") ||
      text.includes("continuar") ||
      text.includes("reanuda") ||
      text.includes("reanudar")
    ) {
      showFeedback("Reanudando", 1500)
      handlersRef.current.onResume()
      return
    }

    // 8. TEMPORIZADOR
    const timerSeconds = parseTimerCommand(text)
    if (timerSeconds !== null) {
      const mins = Math.floor(timerSeconds / 60)
      const secs = timerSeconds % 60
      const desc = mins > 0 ? `${mins} min${secs > 0 ? ` ${secs}s` : ""}` : `${secs}s`
      showFeedback(`Temporizador ajustado: ${desc}`, 2000)
      handlersRef.current.onSetTimer(timerSeconds)
      return
    }

    // If text was heard but nothing recognized in closed vocabulary
    if (text.length > 2) {
      showFeedback("No he entendido el comando", 2000)
    }
  }, [showFeedback])

  // Setup / teardown recognition
  useEffect(() => {
    if (!voiceEnabled) {
      isManuallyStoppedRef.current = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
        recognitionRef.current = null
      }
      setVoiceState("off")
      return
    }

    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      setVoiceState("unsupported")
      return
    }

    isManuallyStoppedRef.current = false

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setVoiceState("listening")
    }

    recognition.onaudiostart = () => {
      setVoiceState("listening")
    }

    recognition.onspeechstart = () => {
      // User is speaking
      setVoiceState("processing")
    }

    recognition.onresult = (event: any) => {
      setVoiceState("listening")
      // Check if TTS is currently speaking. If so, ignore to avoid feedback loop!
      if (isTtsSpeakingRef.current) {
        console.log("[VoiceControl] Ignored speech because TTS is active.")
        return
      }

      const results = event.results
      if (!results || results.length === 0) return

      const lastResult = results[results.length - 1]
      if (lastResult && lastResult.isFinal) {
        const transcript = lastResult[0]?.transcript || ""
        if (transcript) {
          processTranscript(transcript)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.warn("[VoiceControl] Speech recognition error:", event.error)
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceState("error")
        showFeedback("Permiso de micrófono denegado", 3000)
        setVoiceEnabled(false)
        isManuallyStoppedRef.current = true
      } else if (event.error === "no-speech") {
        // Normal silence timeout in some browsers, keep listening
        setVoiceState("listening")
      } else {
        setVoiceState("listening")
      }
    }

    recognition.onend = () => {
      // Auto-restart if still enabled and not manually stopped
      if (!isManuallyStoppedRef.current && voiceEnabled) {
        try {
          recognition.start()
        } catch (e) {
          // If restart fails immediately, retry after brief delay
          setTimeout(() => {
            if (!isManuallyStoppedRef.current) {
              try {
                recognition.start()
              } catch (_) {}
            }
          }, 300)
        }
      } else {
        setVoiceState("off")
      }
    }

    try {
      recognition.start()
    } catch (e) {
      console.error("[VoiceControl] Could not start speech recognition:", e)
      setVoiceState("error")
    }

    recognitionRef.current = recognition

    return () => {
      isManuallyStoppedRef.current = true
      try {
        recognition.abort()
      } catch (_) {}
      recognitionRef.current = null
    }
  }, [voiceEnabled, processTranscript, isTtsSpeakingRef, showFeedback])

  const toggleVoice = useCallback(() => {
    if (!isSupported) {
      showFeedback("Control por voz no disponible en este navegador", 3500)
      return
    }

    setVoiceEnabled(prev => {
      const next = !prev
      if (!next) {
        showFeedback("Control por voz desactivado", 1500)
      } else {
        showFeedback("Control por voz activado. Escuchando...", 2000)
      }
      return next
    })
  }, [isSupported, showFeedback])

  return {
    voiceEnabled,
    voiceState,
    feedbackMessage,
    isSupported,
    toggleVoice,
  }
}
