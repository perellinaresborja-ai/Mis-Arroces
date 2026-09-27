"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { giveawaySound } from "./GiveawaySound"

interface GiveawayNamesRollProps {
  winnerUsername: string
  winnerDisplayName: string
  winnerAvatarUrl?: string | null
  eligibleUsernames: string[]
  onFinish: () => void
  soundEnabled?: boolean
}

export function GiveawayNamesRoll({
  winnerUsername,
  winnerDisplayName,
  winnerAvatarUrl,
  eligibleUsernames,
  onFinish,
  soundEnabled = true
}: GiveawayNamesRollProps) {
  const [spinning, setSpinning] = useState(false)
  const [finished, setFinished] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [displayItems, setDisplayItems] = useState<string[]>([])
  const animRef = useRef<number | null>(null)

  const cleanWinner = winnerUsername.replace(/^@/, "")

  // Construir la tira vertical de nombres
  useEffect(() => {
    const cleanPool = eligibleUsernames
      .map((u) => u.replace(/^@/, ""))
      .filter((u) => u !== cleanWinner)

    const shuffled = [...cleanPool].sort(() => 0.5 - Math.random())
    const strip: string[] = []

    // 50 nombres rápidos antes del ganador
    for (let i = 0; i < 45; i++) {
      strip.push(shuffled[i % (shuffled.length || 1)] || `arrocero_${i + 1}`)
    }
    // El ganador al final
    strip.push(cleanWinner)
    // 2 nombres más para margen visual
    strip.push(shuffled[0] || "arrocero_final")
    strip.push(shuffled[1] || "arrocero_final_2")

    setDisplayItems(strip)
  }, [cleanWinner, eligibleUsernames])

  const startRoll = useCallback(() => {
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

    const container = listRef.current
    if (!container) return

    const itemHeight = 64 // Altura de cada fila en px
    const targetIndex = 45 // Posición del ganador
    const targetScroll = targetIndex * itemHeight

    const duration = 6500 // 6.5 segundos
    const startTime = performance.now()
    let lastTickIndex = 0

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3.5)

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = easeOutCubic(progress)
      const currentScroll = targetScroll * eased

      if (container) {
        container.scrollTop = currentScroll
      }

      // Disparar sonido de tick al pasar de ítem
      const currentIdx = Math.floor(currentScroll / itemHeight)
      if (currentIdx !== lastTickIndex) {
        lastTickIndex = currentIdx
        giveawaySound.playTick(720 + (currentIdx % 4) * 20)
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        if (container) {
          container.scrollTop = targetScroll
        }
        giveawaySound.playReveal()
        setFinished(true)
        setSpinning(false)
        setTimeout(() => {
          onFinish()
        }, 1200)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [spinning, finished, soundEnabled, onFinish])

  useEffect(() => {
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-5 select-none py-4 w-full max-w-sm mx-auto">
      {/* Marco de slot machine vertical */}
      <div className="relative w-full h-[200px] rounded-3xl bg-card border-2 border-primary/40 shadow-xl overflow-hidden">
        {/* Guías decorativas de selección central */}
        <div className="absolute inset-x-0 top-[68px] h-[64px] border-y-2 border-primary bg-primary/10 pointer-events-none z-10 flex items-center justify-between px-3">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>

        {/* Gradientes superior e inferior para efecto 3D */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card via-card/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-20" />

        {/* Lista desplazable */}
        <div
          ref={listRef}
          className="w-full h-full overflow-hidden flex flex-col items-center pt-[68px]"
        >
          {displayItems.map((item, idx) => {
            const isWinnerItem = idx === 45
            return (
              <div
                key={idx}
                className={`h-[64px] flex items-center justify-center px-4 shrink-0 transition-colors ${
                  isWinnerItem && finished
                    ? "text-primary font-black text-xl scale-105"
                    : "text-foreground/80 font-bold text-base"
                }`}
              >
                <span>@{item}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botón de inicio */}
      {!spinning && !finished && (
        <button
          type="button"
          onClick={startRoll}
          className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Iniciar Selección</span>
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
