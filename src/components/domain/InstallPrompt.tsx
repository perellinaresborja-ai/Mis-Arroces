"use client"

import { useEffect, useState } from "react"
import { usePwa } from "@/components/providers/PwaProvider"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { X, ArrowLeft } from "lucide-react"
import Image from "next/image"

const DISMISS_KEY = "misarroces_pwa_dismissed_until"
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function InstallPrompt() {
  const { isInstalled, canInstall, isIos, promptInstall } = usePwa()
  const { user, username } = useUserSession()
  const [isVisible, setIsVisible] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  // Detectar al usuario perellinares para permitirle revisar los textos directamente en pantalla
  const isTargetUser = Boolean(
    user?.id === "d5e0c178-49d0-4160-b122-d518f5d46036" ||
    (username && (username.toLowerCase().includes("perellinares") || username.toLowerCase().includes("pellinares")))
  )

  useEffect(() => {
    // Si es perellinares revisando textos, mostrar tras 1.5s sin importar dispositivo ni bloqueos
    if (isTargetUser) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }

    // Si ya está instalada o en standalone, no mostrar nunca
    if (isInstalled) {
      setIsVisible(false)
      return
    }

    // Comprobar si el usuario la pospuso con "Ahora no" (30 días)
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY)
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return
      }
    } catch {
      // localStorage deshabilitado o bloqueado
    }

    // Solo mostrar si el dispositivo puede instalar la app (Android/Chrome o iOS Safari)
    if (!canInstall && !isIos) {
      return
    }

    // Mostrar tras 6 segundos de uso
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 6000)

    return () => clearTimeout(timer)
  }, [isInstalled, canInstall, isIos, isTargetUser])

  const handleDismiss = () => {
    if (!isTargetUser) {
      try {
        localStorage.setItem(DISMISS_KEY, (Date.now() + THIRTY_DAYS_MS).toString())
      } catch {
        // Silencioso
      }
    }
    setIsVisible(false)
  }

  const handleInstallClick = async () => {
    if (isIos || (!canInstall && isTargetUser)) {
      setShowIosGuide(true)
      return
    }

    if (canInstall) {
      const accepted = await promptInstall()
      if (accepted) {
        setIsVisible(false)
      } else {
        handleDismiss()
      }
    }
  }

  if (!isVisible || (isInstalled && !isTargetUser)) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-label="Instala misarroces"
      className="fixed z-50 left-3.5 right-3.5 bottom-20 md:bottom-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#FAF8F5]/98 dark:bg-[#1C1A17]/98 backdrop-blur-md border border-[#EAE5D9] dark:border-[#2C2822] rounded-3xl p-5 shadow-2xl relative">
        {/* Botón cerrar discreto */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {!showIosGuide ? (
          <div>
            {/* Cabecera con logo integrado */}
            <div className="flex items-start gap-3.5 mb-4 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#25221E] border border-[#EAE5D9] dark:border-[#2C2822] flex items-center justify-center p-2 shrink-0 shadow-xs">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="misarroces"
                  width={36}
                  height={36}
                  className="rounded-lg object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground tracking-tight">
                  Instala misarroces
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Añade la app a tu pantalla de inicio para una experiencia más rápida y a pantalla completa.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all text-center shadow-sm"
              >
                Instalar misarroces
              </button>
            </div>

            {isTargetUser && (
              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Modo revisión (perellinares)</span>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Ver pasos iPhone →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Cabecera iOS */}
            <div className="flex items-start gap-3.5 mb-4 pr-6">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#25221E] border border-[#EAE5D9] dark:border-[#2C2822] flex items-center justify-center p-2 shrink-0 shadow-xs">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="misarroces"
                  width={32}
                  height={32}
                  className="rounded-lg object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground tracking-tight">
                  Instala misarroces
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Añade la app a tu pantalla de inicio en 2 pasos:
                </p>
              </div>
            </div>

            {/* Pasos visuales claros para iPhone / iPad con iconos SVG dedicados */}
            <div className="bg-white/70 dark:bg-card/60 border border-[#EAE5D9] dark:border-[#2C2822] rounded-2xl p-3.5 space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-snug">
                  1. Pulsa el botón <strong className="font-semibold text-foreground">Compartir</strong> en la barra inferior de Safari.
                </p>
              </div>

              <div className="h-px bg-border/60 ml-11" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="4.5" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-snug">
                  2. Selecciona <strong className="font-semibold text-foreground">Añadir a pantalla de inicio</strong>.
                </p>
              </div>
            </div>

            {/* Acciones iOS */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all text-center shadow-sm"
              >
                Entendido
              </button>
              {isTargetUser && (
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Volver al aviso principal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
