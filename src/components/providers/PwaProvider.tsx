"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { InstallPrompt } from "@/components/domain/InstallPrompt"

interface PwaContextType {
  isInstalled: boolean
  canInstall: boolean
  isIos: boolean
  promptInstall: () => Promise<boolean>
}

const PwaContext = createContext<PwaContextType>({
  isInstalled: false,
  canInstall: false,
  isIos: false,
  promptInstall: async () => false,
})

export function usePwa() {
  return useContext(PwaContext)
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)
  const [isIos, setIsIos] = useState<boolean>(false)

  useEffect(() => {
    // 1. Registrar Service Worker de forma silenciosa
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Verificar actualizaciones de service worker en segundo plano
          reg.update().catch(() => {})
        })
        .catch((err) => {
          console.warn("[PWA] Error al registrar service worker:", err)
        })
    }

    // 2. Comprobar si ya está ejecutándose como PWA standalone instalada
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches
      const isStandaloneNavigator = (window.navigator as any).standalone === true
      return isStandaloneMedia || isStandaloneNavigator
    }
    setIsInstalled(checkStandalone())

    // 3. Detectar si el dispositivo es iOS (iPhone / iPad)
    const checkIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    }
    setIsIos(checkIos())

    // 4. Capturar el evento nativo beforeinstallprompt para impedir que el navegador lance el popup cuando quiera
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault() // Evita el banner automático invasivo del navegador
      setDeferredPrompt(e)
    }

    // 5. Detectar cuando el usuario instala la aplicación
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (err) {
      console.error("[PWA] Error al disparar instalador:", err)
      return false
    }
  }

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall: !!deferredPrompt,
        isIos,
        promptInstall,
      }}
    >
      {children}
      <InstallPrompt />
    </PwaContext.Provider>
  )
}
