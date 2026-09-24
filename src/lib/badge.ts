/**
 * Utility to synchronize the native App Badge (PWA / Installed App / Mobile)
 * using the standard W3C Badging API.
 */
export function updateAppBadge(count: number) {
  if (typeof window === "undefined") return

  try {
    if ("setAppBadge" in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(() => {})
      } else {
        navigator.clearAppBadge().catch(() => {})
      }
    }

    // Also communicate to Service Worker controller if available
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: count > 0 ? "SET_BADGE" : "CLEAR_BADGE",
        count,
      })
    }
  } catch {
    // Ignore unsupported environments
  }
}

export function clearAppBadge() {
  updateAppBadge(0)
}
