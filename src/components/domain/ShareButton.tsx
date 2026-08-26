"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Send, Share2, Copy, X } from "lucide-react"
import { useShare } from "@/lib/platform"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function ShareButton({ title, text, path }: { title: string, text: string, path: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuth(!!user))
  }, [])
  const { share } = useShare()

  
  const recipeMatch = path.match(/\/recipes\/([^/?]+)/);
  const sessionMatch = path.match(/\/sessions\/([^/?]+)/);
  const recipeId = recipeMatch ? recipeMatch[1] : null;
  const sessionId = sessionMatch ? sessionMatch[1] : null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  const url = `${baseUrl}${path}`;
  
  // Use a public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff`

  const handleNativeShare = () => {
    share(title, text, url)
  }

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        title="Compartir"
      >
        <Send className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {isOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full sm:max-w-sm bg-white dark:bg-zinc-950 border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end items-center mb-4">
              <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8 bg-white p-4 rounded-2xl w-fit mx-auto border shadow-sm">
              <div className="text-center font-bold text-black mb-3 text-lg tracking-tight line-clamp-2 max-w-[200px]">
                {title || "Mis Arroces"}
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
            
            {isAuth && (
            <div className="mt-3">
              <Button variant="outline" className="w-full font-bold rounded-xl" size="lg" onClick={() => window.location.href = `/create/story?share=${encodeURIComponent(path)}`}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                  Compartir en Historia
              </Button>
            </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

