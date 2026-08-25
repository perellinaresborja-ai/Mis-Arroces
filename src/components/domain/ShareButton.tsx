"use client"

import { Send } from "lucide-react"
import { useShare } from "@/lib/platform"

export function ShareButton({ title, text, path }: { title: string, text: string, path: string }) {
  const { share } = useShare()

  const handleShare = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path
    share(title, text, url)
  }

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
      title="Compartir"
    >
      <Send className="w-6 h-6" strokeWidth={1.5} />
    </button>
  )
}
