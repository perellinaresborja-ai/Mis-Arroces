"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Send, Share2, Copy, X } from "lucide-react"
import { useShare } from "@/lib/platform"
import { Button } from "@/components/ui/button"

export function ProfileShareModal({ username, display_name, path }: { username: string, display_name: string | null, path: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  const { share } = useShare()

  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path
  
  // Use a public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff`

  const handleNativeShare = () => {
    share(display_name || `@${username}`, "¡Mira mi perfil en Mis Arroces!", url)
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
        className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm"
        title="Compartir perfil"
      >
        <Send className="w-5 h-5 -ml-0.5" />
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
              <div className="text-center font-bold text-black mb-3 text-xl tracking-tight">
                @{username}
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
    </>
  )
}
