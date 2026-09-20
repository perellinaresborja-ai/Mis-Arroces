"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { useSearchParams } from "next/navigation"

export function GA4Loader() {
  const [granted, setGranted] = useState(false)
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkConsent = () => {
      const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))?.split('=')[1]
      setGranted(consent === 'granted')
    }
    
    checkConsent()
    
    const interval = setInterval(checkConsent, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (granted && searchParams?.get("signup") === "success") {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "sign_up", { method: "email" })
      }
    }
    if (granted && searchParams?.get("login") === "success") {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "login", { method: "email" })
      }
    }
  }, [granted, searchParams])

  if (!measurementId || !granted) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
