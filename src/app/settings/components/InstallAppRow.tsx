"use client"

import { useState } from "react"
import { usePwa } from "@/components/providers/PwaProvider"
import { ChevronRight, X, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function InstallAppRow() {
  const { isInstalled, canInstall, isIos, promptInstall } = usePwa()
  const [showIosInstructions, setShowIosInstructions] = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)

  // Si ya está abierta en modo app standalone o ya se ha instalado, no mostramos la opción
  if (isInstalled) {
    return null
  }

  // Si no se puede instalar en Android/Chrome y no es iOS, ocultamos la opción para no mostrar secciones vacías
  if (!canInstall && !isIos) {
    return null
  }

  const handleClick = async () => {
    if (isIos) {
      setShowIosInstructions(true)
      return
    }

    if (canInstall) {
      const accepted = await promptInstall()
      if (accepted) {
        setJustInstalled(true)
      }
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Aplicación</h3>
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {justInstalled ? (
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold text-sm">¡misarroces se ha instalado con éxito!</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] dark:bg-[#25221E] border border-[#EAE5D9] dark:border-[#2C2822] flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="misarroces"
                  width={30}
                  height={30}
                  className="rounded-lg object-contain"
                />
              </div>
              <div>
                <span className="font-medium text-foreground block text-sm sm:text-base">
                  Instalar misarroces
                </span>
                <span className="text-xs text-muted-foreground block">
                  Añade la app a tu pantalla de inicio
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Modal de instrucciones visuales para iPhone / iPad */}
      {showIosInstructions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowIosInstructions(false)}
        >
          <div
            className="bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#EAE5D9] dark:border-[#2C2822] rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-start justify-between pr-4">
              <div className="flex items-center gap-3.5">
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
                    Instala misarroces en tu iPhone en 2 pasos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pasos visuales */}
            <div className="bg-white/70 dark:bg-card/60 border border-[#EAE5D9] dark:border-[#2C2822] rounded-2xl p-4 space-y-3">
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

            {/* Botón de cierre */}
            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all text-center shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
