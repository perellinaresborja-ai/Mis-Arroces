"use client"

import { useCallback } from "react"

export function useShare() {
  const share = useCallback(async (title: string, text: string, url: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
        return true
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing", err)
        }
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      alert("Enlace copiado al portapapeles")
      return true
    } catch (err) {
      console.error("Failed to copy", err)
      return false
    }
  }, [])

  return { share }
}
