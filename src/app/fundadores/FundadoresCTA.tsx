"use client"

import { useUserSession } from "@/components/providers/UserSessionProvider"
import { ArrowRight } from "lucide-react"

export function FundadoresCTA() {
  const { user } = useUserSession()

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      window.location.href = "/create/recipe"
    } else {
      document.cookie = `misarroces_return_to=/create/recipe; path=/; max-age=3600`
      window.location.href = "/login?mode=signup&redirect=%2Fcreate%2Frecipe"
    }
  }

  const href = user 
    ? "/create/recipe" 
    : "/login?mode=signup&redirect=%2Fcreate%2Frecipe"

  return (
    <a
      href={href}
      onClick={handleAction}
      className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-[#EA580C]/20 hover:shadow-[#EA580C]/40 active:scale-[0.98] uppercase tracking-wide text-sm"
    >
      QUIERO FORMAR PARTE <ArrowRight className="w-4 h-4" />
    </a>
  )
}
