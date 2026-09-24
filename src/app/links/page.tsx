"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { trackClickAction } from "@/app/actions/tracking"
import { sendGAEvent } from "@/lib/analytics/ga4"
import { Home, Smartphone, Info, BookOpen, Share2, Copy, Check, X, Download } from "lucide-react"
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
    const shareData = {
      title: 'misarroces.es',
      text: 'La red social de los arroces.',
      url,
    }
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        sendGAEvent("share_links", { origin: "/links", method: "native" })
        await navigator.share(shareData)
      } catch (err: any) {
        console.error('Error sharing:', err)
        // Si falla, NO copiamos el enlace para mantener acciones separadas
      }
    } else {
      alert('Tu navegador no soporta la función nativa de compartir. Usa el botón "Copiar link".')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    sendGAEvent("share_links", { origin: "/links", method: "copy" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTracking = (name: string, path: string, requiresAuth: boolean = false) => {
    // 1. Registramos en Analytics (fire-and-forget para no bloquear la navegación)
    trackClickAction('LINK_CLICK', '/links', name, user?.id || 'anonymous').catch(() => {})
    sendGAEvent("link_click", { origin: "/links", button_name: name, destination: path })

    // 2. Si requiere auth y no está logueado, guardamos la cookie de retorno
    if (requiresAuth && !user) {
      document.cookie = `misarroces_return_to=${path}; path=/; max-age=3600`
    }
  }

  const getHref = (path: string, requiresAuth: boolean = false) => {
    return (requiresAuth && !user) ? "/login" : path
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center pt-12 md:pt-24 px-6 relative w-full">
      {/* Logo */}
      <div className="relative w-[118px] h-[118px] mb-4">
        <Image src="/logopaellaicono.png" alt="misarroces Icono" fill sizes="200px" className="object-contain" priority />
      </div>
      
      {/* Títulos */}
      <h1 className="text-2xl font-bold text-foreground mb-1 text-center">misarroces.es</h1>
      <p className="text-muted-foreground text-center mb-10">La red social de los arroces</p>

      {/* Botones */}
      <div className="w-full max-w-sm space-y-4 flex flex-col items-stretch pb-16">
        
        {/* 0. Descargar la app */}
        <Link 
          href={getHref('/descargar', false)}
          onClick={() => handleTracking('Descargar la app', '/descargar', false)}
          className="w-full grid grid-cols-[3rem_1fr_3rem] items-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-2 rounded-3xl shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex justify-center"><Download className="w-5 h-5 shrink-0 stroke-[2.5]" /></div>
          <span className="text-center leading-tight">Descargar la app</span>
          <div />
        </Link>

        {/* 1. Ir a misarroces */}
        <Link 
          href={getHref('/feed', false)}
          onClick={() => handleTracking('Ir a misarroces', '/feed', false)}
          className="w-full grid grid-cols-[3rem_1fr_3rem] items-center bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-2 rounded-3xl shadow-sm transition-all"
        >
          <div className="flex justify-center"><Home className="w-5 h-5 text-muted-foreground shrink-0" /></div>
          <span className="text-center leading-tight">Ir a misarroces</span>
          <div />
        </Link>

        {/* 2. Trae tus recetas de Instagram */}
        <Link 
          href={getHref('/create/recipe#import', true)}
          onClick={() => handleTracking('Trae tus recetas de Instagram', '/create/recipe#import', true)}
          className="w-full grid grid-cols-[3rem_1fr_3rem] items-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-2 rounded-3xl shadow-sm transition-all"
        >
          <div className="flex justify-center"><Smartphone className="w-5 h-5 opacity-80 shrink-0" /></div>
          <span className="text-center leading-tight">Trae tus recetas de Instagram</span>
          <div />
        </Link>

        {/* 3. ¿Qué es misarroces? */}
        <Link 
          href={getHref('/sobre-misarroces', false)}
          onClick={() => handleTracking('¿Qué es misarroces?', '/sobre-misarroces', false)}
          className="w-full grid grid-cols-[3rem_1fr_3rem] items-center bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-2 rounded-3xl shadow-sm transition-all"
        >
          <div className="flex justify-center"><Info className="w-5 h-5 text-muted-foreground shrink-0" /></div>
          <span className="text-center leading-tight">¿Qué es misarroces?</span>
          <div />
        </Link>

        {/* 4. Crea tu recetario */}
        <Link 
          href={getHref('/cookbook', true)}
          onClick={() => handleTracking('Crea tu recetario', '/cookbook', true)}
          className="w-full grid grid-cols-[3rem_1fr_3rem] items-center bg-card border border-border hover:border-primary/50 text-foreground font-semibold py-4 px-2 rounded-3xl shadow-sm transition-all"
        >
          <div className="flex justify-center"><BookOpen className="w-5 h-5 text-muted-foreground shrink-0" /></div>
          <span className="text-center leading-tight">Crea tu recetario</span>
          <div />
        </Link>

        {/* Share Section */}
        <div className="mt-8 pt-8 border-t border-border w-full flex flex-col items-center space-y-4">
          <p className="text-sm font-semibold text-foreground text-center">
            ¿Conoces a alguien que vive por y para el arroz?
          </p>
          <button 
            onClick={handleShareClick}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground bg-secondary/80 hover:bg-secondary px-6 py-2.5 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Compárteselo</span>
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
