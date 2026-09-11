"use client"

import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // 1. Sign out on the client to trigger all client-side listeners immediately
    const supabase = createClient()
    await supabase.auth.signOut()

    // 2. Refresh the Next.js router cache explicitly to obliterate the stale layout
    router.refresh()
    
    // 3. Navigate home
    router.push("/")
  }

  return (
    <button 
      onClick={handleLogout}
      className="w-full py-4 text-red-500 font-bold hover:bg-red-50/10 hover:text-red-400 transition-colors rounded-3xl flex items-center justify-center gap-2"
    >
      <LogOut className="w-5 h-5" /> Cerrar Sesión
    </button>
  )
}
