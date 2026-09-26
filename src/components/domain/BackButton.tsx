"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  fallbackUrl?: string
  className?: string
  iconClassName?: string
  onClick?: () => void
}

export function BackButton({
  fallbackUrl = "/",
  className = "p-2 -ml-2 mr-2 rounded-full hover:bg-muted/80 transition-colors cursor-pointer",
  iconClassName = "w-6 h-6",
  onClick
}: BackButtonProps = {}) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (typeof window !== "undefined") {
      const hasReferrer = document.referrer && document.referrer.includes(window.location.host)
      if (window.history.length > 1 && hasReferrer) {
        router.back()
        return
      }
    }
    router.push(fallbackUrl)
  }

  return (
    <button 
      type="button"
      onClick={handleClick} 
      className={className}
      aria-label="Volver"
    >
      <ArrowLeft className={iconClassName} />
    </button>
  )
}
