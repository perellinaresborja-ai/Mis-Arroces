"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      // Solo mostrar en modo preview explícito mediante ?splash en la URL
      const isSplashPreview = new URLSearchParams(window.location.search).has("splash")
      if (!isSplashPreview) {
        // En arranque normal (PWA o navegador), el splash nativo del sistema operativo
        // o el primer renderizado SSR directo es el flujo óptimo sin bloquear ni añadir esperas artificiales.
        try {
          sessionStorage.setItem("misarroces_splash_shown", "1")
        } catch {}
        return
      }

      setVisible(true)

      const fadeTimer = setTimeout(() => {
        setFading(true)
      }, 150)

      const removeTimer = setTimeout(() => {
        setVisible(false)
      }, 350)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(removeTimer)
      }
    } catch {
      // Ignorar restricciones de almacenamiento en modo incógnito estricto
    }
  }, [])

  if (!visible) return null

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#F7F5F0] transition-opacity duration-200 ease-out select-none pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150 ease-out">
        {/* Logo completo oficial con transparencia y proporciones intactas */}
        <div className="relative w-44 h-48 sm:w-52 sm:h-56">
          <Image
            src="/logopngver.webp"
            alt="misarroces"
            fill
            priority
            sizes="(max-width: 640px) 176px, 208px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
