"use client"

import { usePathname } from "next/navigation"
import { GlobalLegalConsentModal } from "./GlobalLegalConsentModal"

export function LegalConsentGate({ pendingLegal }: { pendingLegal: boolean }) {
  const pathname = usePathname()

  if (!pendingLegal) return null

  // Do not block public legal routes or login
  if (pathname.startsWith('/legal') || pathname.startsWith('/login') || pathname.startsWith('/invite')) {
    return null
  }

  return <GlobalLegalConsentModal />
}
