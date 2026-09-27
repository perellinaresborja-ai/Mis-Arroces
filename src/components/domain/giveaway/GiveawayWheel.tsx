"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { giveawaySound } from "./GiveawaySound"

interface GiveawayWheelProps {
  winnerUsername: string
  winnerDisplayName: string
  winnerAvatarUrl?: string | null
  eligibleUsernames: string[]
  onFinish: () => void
  soundEnabled?: boolean
}

export function GiveawayWheel({
  winnerUsername,
  winnerDisplayName,
  winnerAvatarUrl,
  eligibleUsernames,
  onFinish,
  soundEnabled = true
}: GiveawayWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [finished, setFinished] = useState(false)
  const animFrameRef = useRef<number | null>(null)

  // 1. Construir lista visual de segmentos (máximo 24 para legibilidad y 60 FPS)
  const segments = useRef<string[]>([])
  const winnerIndexRef = useRef<number>(0)

  useEffect(() => {
    const maxSegments = 20
    const cleanWinner = winnerUsername.replace(/^@/, "")
    const cleanPool = eligibleUsernames
      .map((u) => u.replace(/^@/, ""))
      .filter((u) => u !== cleanWinner)

    // Mezclar aleatoriamente el resto para variedad visual
    const shuffled = [...cleanPool].sort(() => 0.5 - Math.random())
    const sliceCount = Math.min(maxSegments, Math.max(8, cleanPool.length + 1))
    
    // Asignar el ganador en una posición fija (ej: índice 3)
    const targetIdx = 3
    const visualList: string[] = []

    for (let i = 0; i < sliceCount; i++) {
      if (i === targetIdx) {
        visualList.push(cleanWinner)
      } else {
        const other = shuffled.pop() || `arrocero_${i + 1}`
        visualList.push(other)
      }
    }

    segments.current = visualList
    winnerIndexRef.current = targetIdx
  }, [winnerUsername, eligibleUsernames])

  // Colores temáticos: crema, negro y naranja
  const colors = [
    { bg: "#1C1917", text: "#FFFDF7", border: "#292524" }, // Negro carbón
    { bg: "#EA580C", text: "#FFFFFF", border: "#C2410C" }, // Naranja
    { bg: "#F8F5EE", text: "#1C1917", border: "#E7E2D5" }, // Crema
    { bg: "#292524", text: "#FFFDF7", border: "#3F3A36" }, // Carbón medio
    { bg: "#FB923C", text: "#1C1917", border: "#EA580C" }  // Naranja claro
  ]

  // Función para dibujar la ruleta dado un ángulo (en radianes)
  const drawWheel = useCallback((currentAngle: number, needleBounce: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const size = canvas.width / dpr
    const center = size / 2
    const radius = center - 16

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)

    const segs = segments.current
    const numSegs = segs.length
    if (numSegs === 0) {
      ctx.restore()
      return
    }
    const arc = (2 * Math.PI) / numSegs

    // Sombra exterior de la ruleta
    ctx.save()
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)"
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 8
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "#1C1917"
    ctx.fill()
    ctx.restore()

    // Borde metálico exterior
    ctx.beginPath()
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI)
    ctx.lineWidth = 8
    ctx.strokeStyle = "#EA580C"
    ctx.stroke()

    // Dibujar segmentos
    for (let i = 0; i < numSegs; i++) {
      const angle = currentAngle + i * arc
      const color = colors[i % colors.length]

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, angle, angle + arc)
      ctx.closePath()

      ctx.fillStyle = color.bg
      ctx.fill()

      ctx.lineWidth = 1.5
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.stroke()

      // Texto de cada segmento (@username)
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(angle + arc / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = color.text
      ctx.font = "bold 13px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"
      
      const label = `@${segs[i]}`
      const truncated = label.length > 14 ? label.slice(0, 13) + "…" : label
      ctx.fillText(truncated, radius - 16, 5)
      ctx.restore()
    }

    // Centro decorativo
    ctx.beginPath()
    ctx.arc(center, center, 32, 0, 2 * Math.PI)
    ctx.fillStyle = "#FFFDF7"
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = "#EA580C"
    ctx.stroke()

    // Perno central
    ctx.beginPath()
    ctx.arc(center, center, 14, 0, 2 * Math.PI)
    ctx.fillStyle = "#1C1917"
    ctx.fill()

    // Indicador / Flecha (Aguja fija arriba en 12 o'clock con ligero bounce)
    ctx.save()
    ctx.translate(center, 12 + needleBounce)
    ctx.beginPath()
    ctx.moveTo(-14, 0)
    ctx.lineTo(14, 0)
    ctx.lineTo(0, 24)
    ctx.closePath()
    ctx.fillStyle = "#EA580C"
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)"
    ctx.shadowBlur = 8
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = "#FFFFFF"
    ctx.stroke()
    ctx.restore()

    ctx.restore()
  }, [])

  // Inicializar canvas al montar
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const displaySize = Math.min(360, window.innerWidth - 48)

    canvas.width = displaySize * dpr
    canvas.height = displaySize * dpr
    canvas.style.width = `${displaySize}px`
    canvas.style.height = `${displaySize}px`

    drawWheel(0, 0)
  }, [drawWheel])

  // Ejecutar el giro
  const spin = useCallback(() => {
    if (spinning || finished) return
    setSpinning(true)
    giveawaySound.init()
    giveawaySound.setEnabled(soundEnabled)

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setTimeout(() => {
        giveawaySound.playReveal()
        setFinished(true)
        setSpinning(false)
        onFinish()
      }, 500)
      return
    }

    const segs = segments.current
    const numSegs = segs.length
    const arc = (2 * Math.PI) / numSegs
    const targetIdx = winnerIndexRef.current

    // La aguja está fija arriba en 12 o'clock (-PI / 2).
    // Para que el centro del segmento targetIdx quede justo debajo de la aguja:
    // (angle + targetIdx * arc + arc / 2) mod 2PI === -PI/2 (o 3PI/2)
    const pointerAngle = (3 * Math.PI) / 2
    const targetBaseAngle = pointerAngle - (targetIdx * arc + arc / 2)

    // Número de vueltas completas (mínimo 6 vueltas completas para suspense)
    const fullSpins = 7
    const totalRotation = fullSpins * 2 * Math.PI + targetBaseAngle

    const duration = 7200 // 7.2 segundos
    const startTime = performance.now()
    let lastTickAngle = 0

    const easeOutCubic = (t: number) => {
      // Curva cinematográfica: inicio suave, crucero rápido y desaceleración progresiva con suspense
      return 1 - Math.pow(1 - t, 3.8)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      const easedProgress = easeOutCubic(progress)
      const currentAngle = totalRotation * easedProgress

      // Calcular si cruzamos un segmento para disparar el sonido de tick y el rebote de la aguja
      const currentSegmentPassed = Math.floor((currentAngle / arc) * 1.5)
      let needleBounce = 0

      if (currentSegmentPassed !== lastTickAngle) {
        lastTickAngle = currentSegmentPassed
        giveawaySound.playTick(650 + Math.random() * 80)
        needleBounce = 3
      }

      drawWheel(currentAngle, needleBounce)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Asegurar alineación milimétrica final
        drawWheel(totalRotation, 0)
        giveawaySound.playReveal()
        setFinished(true)
        setSpinning(false)
        setTimeout(() => {
          onFinish()
        }, 1200)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [spinning, finished, soundEnabled, drawWheel, onFinish])

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-5 select-none py-2">
      {/* Contenedor Ruleta */}
      <div className="relative flex items-center justify-center p-2 rounded-full bg-card border border-border shadow-xl">
        <canvas ref={canvasRef} className="touch-none" />
      </div>

      {/* Botón de inicio o estado */}
      {!spinning && !finished && (
        <button
          type="button"
          onClick={spin}
          className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Girar Ruleta</span>
        </button>
      )}

      {spinning && (
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground animate-pulse">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Buscando al afortunado...</span>
        </div>
      )}
    </div>
  )
}
