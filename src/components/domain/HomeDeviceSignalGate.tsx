"use client"

import { useEffect } from "react"

export function HomeDeviceSignalGate({ showFeed }: { showFeed: boolean }) {
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      if (showFeed) {
        // Ensure the signal is persistently recorded in both localStorage and cookie
        localStorage.setItem("ma_has_account", "1")
        document.cookie = "ma_has_account=1; path=/; max-age=63072000; SameSite=Lax"
      } else {
        // If the server rendered the landing because the cookie wasn't present,
        // but this device has a persistent signal in localStorage from previous use,
        // sync the cookie and reload once to show the feed.
        const hasLocal = localStorage.getItem("ma_has_account") === "1"
        if (hasLocal) {
          document.cookie = "ma_has_account=1; path=/; max-age=63072000; SameSite=Lax"
          window.location.reload()
        }
      }
    } catch {
      // Non-blocking in private modes with storage restrictions
    }
  }, [showFeed])

  return null
}
