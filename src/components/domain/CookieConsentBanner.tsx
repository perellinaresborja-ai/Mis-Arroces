"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function CookieConsentBanner() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if consent is already set
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))
    if (!consent) {
      setShow(true)
    } else {
      // If granted, ensure gtag is updated
      if (consent.split('=')[1] === 'granted') {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': 'granted'
          })
        }
      }
    }
  }, [])

  const handleAccept = () => {
    document.cookie = "cookie_consent=granted; path=/; max-age=31536000; SameSite=Lax"
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
    setShow(false)
    router.refresh()
  }

  const handleReject = () => {
    document.cookie = "cookie_consent=denied; path=/; max-age=31536000; SameSite=Lax"
    // Delete any existing GA cookies (best effort)
    document.cookie.split(";").forEach((c) => {
      if (c.trim().startsWith("_ga")) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
    // Delete visitor ID if it exists
    document.cookie = "misarroces_visitor_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setShow(false)
    router.refresh()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[99999] p-4 bg-background border-t border-border shadow-2xl animate-in slide-in-from-bottom flex flex-col md:flex-row gap-4 justify-between items-center">
      <div className="text-sm text-muted-foreground flex-1">
        Usamos cookies necesarias para que misarroces funcione y, si nos das permiso, analíticas para entender cómo se utiliza y mejorar la plataforma.{" "}
        <a href="/legal/cookies" className="underline hover:text-foreground transition-colors">
          Política de cookies
        </a>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={handleReject}
          className="flex-1 md:flex-none px-6 py-2 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 md:flex-none px-6 py-2 bg-olive text-white rounded-xl font-medium hover:bg-olive/90 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
