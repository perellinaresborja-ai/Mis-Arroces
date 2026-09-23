"use client"

import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Error signing out:", err)
    } finally {
      // Redirigir inmediatamente a /login para permitir iniciar sesión con otra cuenta
      // y limpiar el estado de sesión sin tocar la señal de dispositivo conocido
      window.location.href = "/login"
    }
  }

  return (
    <button 
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full py-4 text-red-500 font-bold hover:bg-red-50/10 hover:text-red-400 transition-colors rounded-3xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
    >
      {isLoggingOut ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
      Cerrar Sesión
    </button>
  )
}
