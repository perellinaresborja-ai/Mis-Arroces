"use client"

import { useEffect } from "react"
import { useSearchParams, usePathname } from "next/navigation"

export function AcquisitionProvider() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we already have acquisition data in this session
    if (typeof window === 'undefined') return
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))?.split('=')[1]
    
    // Only persist acquisition parameters if consent is granted, OR just keep in session storage for the signup flow
    // Rule: "Si el usuario ha aceptado: puede conservarse temporalmente la atribución necesaria hasta completar el registro. Si el registro ocurre directamente en la misma navegación y puedes transportar los datos sin persistencia analítica innecesaria, preferir esa opción. Sin consentimiento: NO crear almacenamiento persistente de marketing/analytics innecesario."
    // SessionStorage is transient (per window/tab).
    
    const existing = sessionStorage.getItem("acq_data")
    if (existing) return // Already captured first touch for this tab

    // Extract utms
    const source = searchParams?.get("utm_source")
    const medium = searchParams?.get("utm_medium")
    const campaign = searchParams?.get("utm_campaign")
    const content = searchParams?.get("utm_content")
    const term = searchParams?.get("utm_term")
    const referrer = document.referrer

    // If there's any acquisition signal, save it
    if (source || medium || campaign || referrer) {
      const acqData = {
        utm_source: source || null,
        utm_medium: medium || null,
        utm_campaign: campaign || null,
        utm_content: content || null,
        utm_term: term || null,
        referrer: referrer || null,
        landing_path: pathname || '/'
      }
      sessionStorage.setItem("acq_data", JSON.stringify(acqData))
    }
  }, [searchParams, pathname])

  return null
}
