"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { trackClickAction } from "@/app/actions/tracking"
import { sendGAEvent } from "@/lib/analytics/ga4"
import { Home, Smartphone, Info, BookOpen, Share2, Copy, Check, X } from "lucide-react"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { Button } from "@/components/ui/button"

export default function LinksPage() {
  const { user } = useUserSession()
  const [copied, setCopied] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleShareClick = () => {
    setIsShareOpen(true)
    trackClickAction('SHARE_LINKS_OPEN', '/links', 'share', user?.id || 'anonymous').catch(() => {})
  }

  const url = "https://www.misarroces.es/links"
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff`

  const handleNativeShare = async () => {
    sendGAEvent("share_links", { origin: "/links", method: "native" })
    const shareData = {
      title: 'misarroces.es',
      text: 'La red social de los arroces.',
      url,
    }
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    sendGAEvent("share_links", { origin: "/links", method: "copy" })
    setTimeout(() => setCopied(false), 2000)
  }

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

        {/* Share Section */}
        <div className="mt-8 pt-8 border-t border-border w-full flex flex-col items-center space-y-3 opacity-90">
          <h2 className="text-sm font-bold text-foreground">Comparte misarroces</h2>
          <p className="text-xs text-muted-foreground text-center">
            ¿Conoces a alguien que vive por y para el arroz? Compárteselo.
          </p>
          <button 
            onClick={handleShareClick}
            className="mt-2 inline-flex items-center justify-center gap-2 text-xs font-medium text-foreground bg-secondary/60 hover:bg-secondary px-5 py-2.5 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir enlace</span>
          </button>
        </div>

      </div>

      {isShareOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={() => setIsShareOpen(false)}
        >
          <div 
            className="w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end items-center mb-4">
              <button onClick={() => setIsShareOpen(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8 bg-white p-4 rounded-2xl w-fit mx-auto border border-border shadow-sm">
              <div className="text-center font-bold text-black mb-3 text-lg tracking-tight">
                misarroces.es
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleNativeShare} className="w-full font-bold rounded-xl" size="lg">
                <Share2 className="w-4 h-4 mr-2" /> Compartir
              </Button>
              <Button onClick={handleCopy} variant="secondary" className="w-full font-bold rounded-xl" size="lg">
                <Copy className="w-4 h-4 mr-2" /> {copied ? "¡Copiado!" : "Copiar link"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
