"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Solo mostrar una vez por sesión para máxima agilidad de navegación
    if (typeof window === "undefined") return

    try {
      const alreadyShown = sessionStorage.getItem("misarroces_splash_shown")
      if (alreadyShown) {
        return
      }
    } catch {
      // Ignorar restricciones de almacenamiento en modo incógnito estricto
    }

    setVisible(true)

    // Iniciar desvanecimiento suave inmediatamente tras la hidratación
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 220)

    // Eliminar completamente del DOM tras la animación de salida
    const removeTimer = setTimeout(() => {
      setVisible(false)
      try {
        sessionStorage.setItem("misarroces_splash_shown", "1")
      } catch {}
    }, 520)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#F7F5F0] transition-opacity duration-300 ease-out select-none pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-250 ease-out">
        {/* Paella con la 'm' oficial */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-sm">
          <Image
            src="/icons/icon-512x512.png"
            alt="misarroces"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Micro-marca sutil */}
        <div className="mt-4 text-center">
          <span className="text-[17px] font-black tracking-tight text-[#18181B]">
            mis<span className="text-[#EA580C]">arroces</span>
          </span>
        </div>
      </div>
    </div>
  )
}
