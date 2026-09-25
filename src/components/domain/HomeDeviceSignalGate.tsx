"use client"

import { useEffect } from "react"
import { useUserSession } from "@/components/providers/UserSessionProvider"

export function HomeDeviceSignalGate({ isAnonymous }: { isAnonymous?: boolean }) {
  const { user } = useUserSession()

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      if (user) {
        // Asegurar que la señal de cuenta persiste en cookie y localStorage
        localStorage.setItem("ma_has_account", "1")
        document.cookie = "ma_has_account=1; path=/; max-age=63072000; SameSite=Lax"
      } else if (isAnonymous) {
        // Si el servidor renderizó la vista anónima porque la cookie no existía,
        // pero localStorage tiene señal de cuenta previa en este dispositivo,
        // sincronizar la cookie para que los siguientes arranques reconozcan el dispositivo.
        const hasLocal = localStorage.getItem("ma_has_account") === "1"
        if (hasLocal) {
          document.cookie = "ma_has_account=1; path=/; max-age=63072000; SameSite=Lax"
        }
      }
    } catch {}
  }, [user, isAnonymous])

  return null
}
