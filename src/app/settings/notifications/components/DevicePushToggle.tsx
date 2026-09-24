"use client"

import { useEffect, useState } from "react"
import { usePwa } from "@/components/providers/PwaProvider"
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from "@/app/actions/push"
import { Bell, BellOff, Info, AlertTriangle } from "lucide-react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function DevicePushToggle() {
  const { isIos, isInstalled } = usePwa()
  const [isSupported, setIsSupported] = useState<boolean>(true)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function checkSubscription() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("Notification" in window) ||
        !("PushManager" in window)
      ) {
        setIsSupported(false)
        setLoading(false)
        return
      }

      setPermission(Notification.permission)

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.warn("[Push] Error checking subscription status:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  const handleToggle = async (enable: boolean) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      if (!isSupported) {
        setErrorMessage("Este dispositivo o navegador no admite notificaciones push.")
        setLoading(false)
        return
      }

      // Requisito estricto de iOS 16.4+: PWA instalada en pantalla de inicio
      if (isIos && !isInstalled) {
        setErrorMessage(
          "En iPhone/iPad, para recibir notificaciones debes añadir primero misarroces a tu pantalla de inicio (botón Compartir > Añadir a pantalla de inicio)."
        )
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.ready

      if (enable) {
        // Pedir permiso explícito al usuario tras su interacción
        const permResult = await Notification.requestPermission()
        setPermission(permResult)

        if (permResult !== "granted") {
          if (permResult === "denied") {
            setErrorMessage(
              "Permiso denegado. Para activar notificaciones, debes habilitar los permisos en los ajustes de tu navegador o dispositivo."
            )
          }
          setLoading(false)
          return
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
          setErrorMessage("Configuración de notificaciones incompleta en el servidor (falta clave pública VAPID).")
          setLoading(false)
          return
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
        let sub = await registration.pushManager.getSubscription()

        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
        }

        const serialized = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
          },
        }

        const res = await registerPushSubscription(serialized, navigator.userAgent)
        if (res?.error) {
          setErrorMessage(res.error)
          setIsSubscribed(false)
        } else {
          setIsSubscribed(true)
        }
      } else {
        // Desactivar
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await unregisterPushSubscription(sub.endpoint)
          await sub.unsubscribe()
        }
        setIsSubscribed(false)
      }
    } catch (err: any) {
      console.error("[Push] Toggle error:", err)
      setErrorMessage(err?.message || "Ocurrió un error al configurar las notificaciones en este dispositivo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 pr-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5 shrink-0">
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-base leading-snug">
              Notificaciones en este dispositivo
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Recibe avisos al instante y mantén el icono actualizado aunque la app esté cerrada.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isSubscribed && permission === "granted"}
            disabled={loading || (!isSupported && !isIos)}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {isIos && !isInstalled && (
        <div className="flex items-start gap-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-xl border border-amber-500/20">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            En iPhone / iPad es obligatorio tener instalada <strong>misarroces</strong> en la pantalla de inicio
            (Compartir &gt; Añadir a pantalla de inicio) para recibir notificaciones push.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2 text-xs bg-destructive/10 text-destructive p-3 rounded-xl border border-destructive/20">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {permission === "denied" && !errorMessage && (
        <div className="flex items-start gap-2 text-xs bg-muted text-muted-foreground p-3 rounded-xl border border-border">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Los permisos están bloqueados en tu navegador. Para activarlas, accede a la configuración de permisos del sitio y selecciona "Permitir".
          </span>
        </div>
      )}
    </div>
  )
}
