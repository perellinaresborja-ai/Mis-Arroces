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

// Accent & punctuation normalizer
function normalizeSpanish(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim()
}

// Convert Spanish words to numbers
function parseSpanishNumber(wordOrDigits: string): number | null {
  const trimmed = normalizeSpanish(wordOrDigits)
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
    "dieciseis": 16,
    "diecisiete": 17,
    "dieciocho": 18,
    "diecinueve": 19,
    "veinte": 20,
    "veintiuno": 21,
    "veintidos": 22,
    "veintitres": 23,
    "veinticuatro": 24,
    "veinticinco": 25,
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
  const clean = normalizeSpanish(transcript)
  
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
  const isPermanentErrorRef = useRef<boolean>(false)
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
        console.log("[VOICE] unsupported")
        setIsSupported(false)
        setVoiceState("unsupported")
      } else {
        console.log("[VOICE] supported")
      }
    }
  }, [])

  // Command parser
  const processTranscript = useCallback((rawTranscript: string) => {
    const original = rawTranscript.trim()
    const normalized = normalizeSpanish(original)
    console.log(`[VOICE] onresult transcript="${original}"`)
    console.log(`[VOICE] normalized="${normalized}"`)

    // Check if in confirmation mode for finish
    if (pendingFinishRef.current) {
      if (normalized.includes("si") || normalized.includes("confirmar") || normalized.includes("afirmativo") || normalized.includes("correcto")) {
        console.log('[VOICE] command="CONFIRM_FINISH"')
        showFeedback("Confirmado: terminando", 2000)
        handlersRef.current.onConfirmFinish()
        return
      }
      if (normalized.includes("no") || normalized.includes("cancelar") || normalized.includes("espera") || normalized.includes("todavia no") || normalized.includes("seguir")) {
        console.log('[VOICE] command="CANCEL_FINISH"')
        showFeedback("Terminación cancelada", 2000)
        handlersRef.current.onCancelFinish()
        return
      }
      console.log("[VOICE] no command matched")
      showFeedback("Por favor di 'sí' para confirmar o 'no' para continuar", 3000)
      return
    }

    // 1. TERMINAR (Must require confirmation)
    if (
      normalized.includes("terminar elaboracion") ||
      normalized.includes("terminar") ||
      normalized.includes("finalizar")
    ) {
      console.log('[VOICE] command="FINISH"')
      showFeedback("¿Seguro que deseas terminar? Di 'sí' o 'no'", 4000)
      handlersRef.current.onFinishRequest()
      return
    }

    // 2. SIGUIENTE
    if (
      normalized.includes("siguiente paso") ||
      normalized.includes("siguiente") ||
      normalized.includes("continuar paso") ||
      normalized.includes("avanzar")
    ) {
      console.log('[VOICE] command="NEXT"')
      showFeedback("Siguiente paso", 1500)
      handlersRef.current.onNext()
      return
    }

    // 3. ANTERIOR
    if (
      normalized.includes("paso anterior") ||
      normalized.includes("anterior") ||
      normalized.includes("volver")
    ) {
      console.log('[VOICE] command="PREV"')
      showFeedback("Paso anterior", 1500)
      handlersRef.current.onPrev()
      return
    }

    // 4. REPETIR
    if (
      normalized.includes("repite el paso") ||
      normalized.includes("repite") ||
      normalized.includes("repetir")
    ) {
      console.log('[VOICE] command="REPEAT"')
      showFeedback("Repitiendo paso...", 1500)
      handlersRef.current.onRepeat()
      return
    }

    // 5. TIEMPO RESTANTE
    if (
      normalized.includes("cuanto queda") ||
      normalized.includes("cuanto tiempo queda") ||
      normalized.includes("tiempo restante")
    ) {
      console.log('[VOICE] command="WHAT_LEFT"')
      handlersRef.current.onWhatLeft()
      return
    }

    // 6. PAUSA
    if (
      normalized.includes("pausa") ||
      normalized.includes("pausar") ||
      normalized.includes("para el temporizador") ||
      normalized.includes("para el timer")
    ) {
      console.log('[VOICE] command="PAUSE"')
      showFeedback("Pausa", 1500)
      handlersRef.current.onPause()
      return
    }

    // 7. CONTINUAR
    if (
      normalized.includes("continua") ||
      normalized.includes("continuar") ||
      normalized.includes("reanuda") ||
      normalized.includes("reanudar")
    ) {
      console.log('[VOICE] command="RESUME"')
      showFeedback("Reanudando", 1500)
      handlersRef.current.onResume()
      return
    }

    // 8. TEMPORIZADOR
    const timerSeconds = parseTimerCommand(normalized)
    if (timerSeconds !== null) {
      console.log(`[VOICE] command="SET_TIMER" (${timerSeconds}s)`)
      const mins = Math.floor(timerSeconds / 60)
      const secs = timerSeconds % 60
      const desc = mins > 0 ? `${mins} min${secs > 0 ? ` ${secs}s` : ""}` : `${secs}s`
      showFeedback(`Temporizador ajustado: ${desc}`, 2000)
      handlersRef.current.onSetTimer(timerSeconds)
      return
    }

    console.log("[VOICE] no command matched")
    if (normalized.length > 2) {
      showFeedback("No he entendido el comando", 2000)
    }
  }, [showFeedback])

  // Setup / teardown recognition
  useEffect(() => {
    if (!voiceEnabled) {
      isManuallyStoppedRef.current = true
      if (recognitionRef.current) {
        console.log("[VOICE] manually stopped")
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
      console.log("[VOICE] unsupported")
      setIsSupported(false)
      setVoiceState("unsupported")
      return
    }

    isManuallyStoppedRef.current = false
    isPermanentErrorRef.current = false

    console.log("[VOICE] start requested")

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log("[VOICE] onstart")
      setVoiceState("listening")
    }

    recognition.onaudiostart = () => {
      console.log("[VOICE] onaudiostart")
    }

    recognition.onsoundstart = () => {
      console.log("[VOICE] onsoundstart")
    }

    recognition.onspeechstart = () => {
      console.log("[VOICE] onspeechstart")
      setVoiceState("processing")
    }

    recognition.onnomatch = () => {
      console.log("[VOICE] onnomatch")
      setVoiceState("listening")
    }

    recognition.onresult = (event: any) => {
      setVoiceState("listening")
      // Check if TTS is currently speaking. If so, ignore to avoid feedback loop!
      if (isTtsSpeakingRef.current) {
        console.log("[VOICE] Ignored speech because TTS is active.")
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
      console.log(`[VOICE] onerror error="${event.error}"`)
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        isPermanentErrorRef.current = true
        isManuallyStoppedRef.current = true
        setVoiceState("error")
        showFeedback("Permite el acceso al micrófono para usar el control por voz.", 4000)
        setVoiceEnabled(false)
      } else if (event.error === "audio-capture") {
        isPermanentErrorRef.current = true
        isManuallyStoppedRef.current = true
        setVoiceState("error")
        showFeedback("No se ha detectado ningún micrófono.", 4000)
        setVoiceEnabled(false)
      } else if (event.error === "no-speech") {
        // Normal silence timeout in some browsers, keep listening
        setVoiceState("listening")
      } else if (event.error === "aborted") {
        // Expected when stopped manually
      } else {
        setVoiceState("listening")
      }
    }

    recognition.onend = () => {
      console.log("[VOICE] onend")
      // Auto-restart if still enabled and not manually stopped
      if (!isManuallyStoppedRef.current && !isPermanentErrorRef.current && voiceEnabled) {
        console.log("[VOICE] restart requested")
        setTimeout(() => {
          if (!isManuallyStoppedRef.current && !isPermanentErrorRef.current && voiceEnabled) {
            try {
              recognition.start()
              console.log("[VOICE] recognition.start OK (restart)")
            } catch (e: any) {
              console.warn("[VOICE] restart failed:", e?.message)
            }
          }
        }, 300)
      } else {
        setVoiceState("off")
      }
    }

    try {
      recognition.start()
      console.log("[VOICE] recognition.start OK")
    } catch (e) {
      console.error("[VOICE] recognition.start failed exception:", e)
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

  const toggleVoice = useCallback(async () => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log("[VOICE] unsupported")
      showFeedback("Control por voz no disponible en este navegador.", 3500)
      return
    }

    // Explicit microphone permission check upon activation
    if (!voiceEnabled) {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // Immediately stop tracks to free mic for SpeechRecognition
          stream.getTracks().forEach(t => t.stop())
        } catch (err: any) {
          console.log(`[VOICE] getUserMedia denied/error: ${err?.name || err?.message}`)
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            showFeedback("Permite el acceso al micrófono para usar el control por voz.", 4000)
            setVoiceState("error")
            return
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            showFeedback("No se ha detectado ningún micrófono.", 4000)
            setVoiceState("error")
            return
          }
        }
      }
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
  }, [voiceEnabled, showFeedback])

  return {
    voiceEnabled,
    voiceState,
    feedbackMessage,
    isSupported,
    toggleVoice,
  }
}
