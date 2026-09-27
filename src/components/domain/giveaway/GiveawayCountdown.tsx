"use client"

import { useEffect, useState, useCallback } from "react"
import { Trophy, Sparkles } from "lucide-react"
import { giveawaySound } from "./GiveawaySound"

interface GiveawayCountdownProps {
  winnerUsername: string
  winnerDisplayName: string
  winnerAvatarUrl?: string | null
  onFinish: () => void
  soundEnabled?: boolean
}

export function GiveawayCountdown({
  winnerUsername,
  winnerDisplayName,
  winnerAvatarUrl,
  onFinish,
  soundEnabled = true
}: GiveawayCountdownProps) {
  const [step, setStep] = useState<"idle" | "3" | "2" | "1" | "suspense" | "reveal">("idle")

  const startCountdown = useCallback(() => {
    if (step !== "idle") return
    giveawaySound.init()
    giveawaySound.setEnabled(soundEnabled)

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      giveawaySound.playReveal()
      setStep("reveal")
      setTimeout(() => onFinish(), 1000)
      return
    }

    setStep("3")
    giveawaySound.playTick(500)

    setTimeout(() => {
      setStep("2")
      giveawaySound.playTick(600)
    }, 1200)

    setTimeout(() => {
      setStep("1")
      giveawaySound.playTick(750)
    }, 2400)

    setTimeout(() => {
      setStep("suspense")
    }, 3600)

    setTimeout(() => {
      setStep("reveal")
      giveawaySound.playReveal()
      setTimeout(() => onFinish(), 1500)
    }, 4500)
  }, [step, soundEnabled, onFinish])

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 min-h-[260px] select-none text-center">
      {step === "idle" && (
        <button
          type="button"
          onClick={startCountdown}
          className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Iniciar Cuenta Atrás</span>
        </button>
      )}

      {(step === "3" || step === "2" || step === "1") && (
        <div className="animate-in zoom-in-50 duration-300">
          <span className="text-8xl sm:text-9xl font-black text-primary drop-shadow-md">
            {step}
          </span>
        </div>
      )}

      {step === "suspense" && (
        <div className="animate-pulse space-y-2">
          <div className="text-xs uppercase font-black tracking-widest text-muted-foreground">
            Y el ganador es...
          </div>
          <div className="w-12 h-1 bg-primary/40 rounded-full mx-auto" />
        </div>
      )}

      {step === "reveal" && (
        <div className="space-y-4 animate-in zoom-in-75 fade-in duration-500 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>

          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-4 border-primary shadow-xl">
              {winnerAvatarUrl ? (
                <img
                  src={winnerAvatarUrl}
                  alt={winnerUsername}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xl text-primary">
                  {winnerUsername.replace(/^@/, "")[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              ¡Enhorabuena!
            </div>
            <h3 className="text-xl font-black text-foreground">
              {winnerDisplayName || winnerUsername}
            </h3>
            <span className="text-sm font-bold text-primary">
              @{winnerUsername.replace(/^@/, "")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
