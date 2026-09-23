"use client"

import { useEffect, useState } from "react"
import { usePwa } from "@/components/providers/PwaProvider"
import { Share, PlusSquare, Sparkles, X } from "lucide-react"
import Image from "next/image"

const DISMISS_KEY = "misarroces_pwa_dismissed_until"
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function InstallPrompt() {
  const { isInstalled, canInstall, isIos, promptInstall } = usePwa()
  const [isVisible, setIsVisible] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
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

    // Mostrar tras unos segundos de uso (6 segundos) para que sea una experiencia agradable y no intrusiva
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 6000)

    return () => clearTimeout(timer)
  }, [isInstalled, canInstall, isIos])

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, (Date.now() + THIRTY_DAYS_MS).toString())
    } catch {
      // Silencioso
    }
    setIsVisible(false)
  }

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true)
      return
    }

    if (canInstall) {
      const accepted = await promptInstall()
      if (accepted) {
        setIsVisible(false)
      } else {
        // Si el usuario canceló el diálogo nativo de Chrome, guardamos el descarte por 30 días
        handleDismiss()
      }
    }
  }

  if (!isVisible || isInstalled) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar misarroces"
      className="fixed z-50 left-4 right-4 bottom-20 md:bottom-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-3xl p-5 shadow-2xl relative">
        {/* Botón cerrar sutil */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        {!showIosGuide ? (
          <div>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-border/80 flex items-center justify-center p-1 shrink-0 shadow-sm">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="misarroces"
                  width={44}
                  height={44}
                  className="rounded-xl object-contain"
                />
              </div>
              <div className="pr-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-foreground">Instalar misarroces</h3>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Acceso directo desde tu pantalla de inicio, a pantalla completa y con la mejor experiencia.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-center"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-[1.5] py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-center shadow-sm"
              >
                Instalar misarroces
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-border flex items-center justify-center p-1 shrink-0">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="misarroces"
                  width={36}
                  height={36}
                  className="rounded-xl object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Cómo instalar en tu iPhone</h3>
                <p className="text-xs text-muted-foreground">Sigue estos sencillos pasos en Safari:</p>
              </div>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-2xl border border-border text-xs sm:text-sm space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span className="text-foreground leading-tight">
                  1. Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span className="text-foreground leading-tight">
                  2. Baja y selecciona <strong>“Añadir a pantalla de inicio”</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              ¡Entendido!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
