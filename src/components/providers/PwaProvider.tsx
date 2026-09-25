"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
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
          reg.update().catch(() => {})
        })
        .catch((err) => {
          console.warn("[PWA] Error al registrar service worker:", err)
        })
    }

    // 2. Comprobar si ya está instalada (standalone, referrer de app nativa/TWA o flag persistente)
    const checkInstalled = async () => {
      if (typeof window === "undefined") return false

      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches
      const isStandaloneNavigator = (window.navigator as any).standalone === true
      const isReferrerAndroidApp = document.referrer.includes("android-app://")

      let localFlag = false
      try {
        localFlag = localStorage.getItem("misarroces_pwa_installed") === "true"
      } catch {}

      if (isStandaloneMedia || isStandaloneNavigator || isReferrerAndroidApp || localFlag) {
        setIsInstalled(true)
        return true
      }

      // Detección nativa de Chrome en Android (si ya se instaló la PWA relacionada)
      if ("getInstalledRelatedApps" in navigator) {
        try {
          const related = await (navigator as any).getInstalledRelatedApps()
          if (related && related.length > 0) {
            setIsInstalled(true)
            return true
          }
        } catch {}
      }

      return false
    }

    checkInstalled()

    // 3. Detectar si el dispositivo es iOS (iPhone / iPad)
    const checkIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    }
    setIsIos(checkIos())

    // 4. Capturar el prompt si el script temprano inline ya lo atrapó antes de hidratar
    if (typeof window !== "undefined" && (window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt)
    }

    // 5. Manejadores de eventos de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__deferredPrompt = e
      setDeferredPrompt(e)
    }

    const handlePromptReady = () => {
      if (typeof window !== "undefined" && (window as any).__deferredPrompt) {
        setDeferredPrompt((window as any).__deferredPrompt)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      if (typeof window !== "undefined") {
        ;(window as any).__deferredPrompt = null
        try {
          localStorage.setItem("misarroces_pwa_installed", "true")
        } catch {}
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("pwa-prompt-ready", handlePromptReady)
    window.addEventListener("appinstalled", handleAppInstalled)
    window.addEventListener("pwa-installed", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("pwa-prompt-ready", handlePromptReady)
      window.removeEventListener("appinstalled", handleAppInstalled)
      window.removeEventListener("pwa-installed", handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPrompt || (typeof window !== "undefined" ? (window as any).__deferredPrompt : null)
    if (!prompt) {
      return false
    }

    try {
      prompt.prompt()
      const choiceResult = await prompt.userChoice
      if (choiceResult && choiceResult.outcome === "accepted") {
        setIsInstalled(true)
        setDeferredPrompt(null)
        if (typeof window !== "undefined") {
          ;(window as any).__deferredPrompt = null
          try {
            localStorage.setItem("misarroces_pwa_installed", "true")
          } catch {}
        }
        return true
      }
      return false
    } catch (err) {
      console.error("[PWA] Error al disparar instalador:", err)
      return false
    }
  }, [deferredPrompt])

  const hasInstallPrompt = !!deferredPrompt || (typeof window !== "undefined" && !!(window as any).__deferredPrompt)

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall: hasInstallPrompt,
        isIos,
        promptInstall,
      }}
    >
      {children}
      <InstallPrompt />
    </PwaContext.Provider>
  )
}
