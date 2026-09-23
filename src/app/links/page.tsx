"use client"

import Image from "next/image"
import { trackClickAction } from "@/app/actions/tracking"
import { sendGAEvent } from "@/lib/analytics/ga4"
import { Home, Smartphone, Info, BookOpen } from "lucide-react"
import { useUserSession } from "@/components/providers/UserSessionProvider"

export default function LinksPage() {
  const { user } = useUserSession()

  const handleAction = (name: string, path: string, requiresAuth: boolean = false) => {
    // 1. Registramos en Analytics (fire-and-forget para no bloquear la navegación)
    trackClickAction('LINK_CLICK', '/links', name, user?.id || 'anonymous').catch(() => {})
    sendGAEvent("link_click", { origin: "/links", button_name: name, destination: path })

    // 2. Navegación directa forzada con window.location para evitar cuelgues del router en esta vista
    if (requiresAuth && !user) {
      document.cookie = `misarroces_return_to=${path}; path=/; max-age=3600`
      window.location.href = "/login"
    } else {
      window.location.href = path
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center pt-12 md:pt-24 px-6 relative w-full">
      {/* Logo */}
      <div className="relative w-28 h-28 mb-4">
        <Image src="/logopaellaicono.png" alt="misarroces Icono" fill sizes="200px" className="object-contain" priority />
      </div>
      
      {/* Títulos */}
      <h1 className="text-2xl font-bold text-foreground mb-1 text-center">misarroces.es</h1>
      <p className="text-muted-foreground text-center mb-10">La red social de los arroces</p>

      {/* Botones */}
      <div className="w-full max-w-sm space-y-4 flex flex-col items-stretch pb-16">
        
        {/* 1. Ir a misarroces */}
        <button 
          onClick={() => handleAction('Ir a misarroces', '/', false)}
          className="w-full flex items-center justify-center relative bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-6 rounded-3xl shadow-sm transition-all"
        >
          <Home className="w-5 h-5 absolute left-6 text-muted-foreground" />
          <span>Ir a misarroces</span>
        </button>

        {/* 2. Trae tus recetas de Instagram */}
        <button 
          onClick={() => handleAction('Trae tus recetas de Instagram', '/create/recipe#import', true)}
          className="w-full flex items-center justify-center relative bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-3xl shadow-sm transition-all"
        >
          <Smartphone className="w-5 h-5 absolute left-6 opacity-80" />
          <span>Trae tus recetas de Instagram</span>
        </button>

        {/* 3. ¿Qué es misarroces? */}
        <button 
          onClick={() => handleAction('¿Qué es misarroces?', '/sobre-misarroces', false)}
          className="w-full flex items-center justify-center relative bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-6 rounded-3xl shadow-sm transition-all"
        >
          <Info className="w-5 h-5 absolute left-6 text-muted-foreground" />
          <span>¿Qué es misarroces?</span>
        </button>

        {/* 4. Crea tu recetario */}
        <button 
          onClick={() => handleAction('Crea tu recetario', '/cookbook', true)}
          className="w-full flex items-center justify-center relative bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-6 rounded-3xl shadow-sm transition-all"
        >
          <BookOpen className="w-5 h-5 absolute left-6 text-muted-foreground" />
          <span>Crea tu recetario</span>
        </button>

      </div>
    </div>
  )
}
