"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()} 
      className="p-2 -ml-2 mr-2 rounded-full hover:bg-muted/80 transition-colors"
      aria-label="Volver"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  )
}
