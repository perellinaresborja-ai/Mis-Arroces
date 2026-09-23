"use client"

import { useState } from "react"
import { usePwa } from "@/components/providers/PwaProvider"
import { Smartphone, ChevronRight, X, CheckCircle2 } from "lucide-react"

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
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-medium text-foreground block text-sm sm:text-base">
                  Instalar misarroces
                </span>
                <span className="text-xs text-muted-foreground block">
                  Accede directamente desde tu pantalla de inicio como una app
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Modal de instrucciones para iPhone / iPad */}
      {showIosInstructions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowIosInstructions(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-border flex items-center justify-center p-1.5 shrink-0">
                  <img src="/icons/icon-192x192.png" alt="misarroces" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Instalar en tu iPhone</h3>
                  <p className="text-xs text-muted-foreground">Sigue estos pasos en Safari:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pasos */}
            <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="leading-snug text-foreground">
                  Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari (el icono de un recuadro con flecha hacia arriba).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="leading-snug text-foreground">
                  Desplázate hacia abajo y pulsa en <strong>“Añadir a pantalla de inicio”</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="leading-snug text-foreground">
                  Pulsa <strong>“Añadir”</strong> arriba a la derecha. ¡Y listo!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
