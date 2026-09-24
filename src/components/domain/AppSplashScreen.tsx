"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const isSplashPreview = new URLSearchParams(window.location.search).has("splash")
      const alreadyShown = sessionStorage.getItem("misarroces_splash_shown")
      if (alreadyShown && !isSplashPreview) {
        return
      }
    } catch {
      // Ignorar restricciones de almacenamiento en modo incógnito estricto
    }

    setVisible(true)

    // Microanimación de entrada y permanencia breve elegante (sin retrasos artificiales)
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 600)

    // Transición suave hacia la aplicación y desmontaje del DOM
    const removeTimer = setTimeout(() => {
      setVisible(false)
      try {
        sessionStorage.setItem("misarroces_splash_shown", "1")
      } catch {}
    }, 900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#F7F2E8] transition-opacity duration-300 ease-out select-none pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200 ease-out">
        {/* Logo completo oficial con transparencia y proporciones intactas */}
        <div className="relative w-44 h-48 sm:w-52 sm:h-56">
          <Image
            src="/logopngver.png"
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
