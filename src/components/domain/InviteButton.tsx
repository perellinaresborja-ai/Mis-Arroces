"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { UserPlus, Share2, Copy, X } from "lucide-react"
import { useShare } from "@/lib/platform"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function InviteButton({ inviteCode }: { inviteCode: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => setIsMounted(true), [])
  const { share } = useShare()

  if (!inviteCode) return null

  const url = typeof window !== "undefined" ? `${window.location.origin}/invite/${inviteCode}` : `/invite/${inviteCode}`
  const text = "Únete a Mis Arroces y descubre recetas de arroz."

  const handleNativeShare = () => {
    share("Mis Arroces", text, url)
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
        title="Invitar amigos"
      >
        <UserPlus className="w-5 h-5" />
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
            
            <div className="text-center mb-6">
              <div className="relative w-32 h-8 mx-auto mb-4">
                <Image src="/mpng.png" alt="Mis Arroces" fill className="object-contain" />
              </div>
              <h2 className="text-xl font-bold font-serif mb-2">Invita a tus amigos</h2>
              <p className="text-muted-foreground text-sm">
                Comparte tu enlace personal y descubre juntos las mejores recetas de la comunidad.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleNativeShare} className="w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white" size="lg">
                <Share2 className="w-4 h-4 mr-2" /> Enviar
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
