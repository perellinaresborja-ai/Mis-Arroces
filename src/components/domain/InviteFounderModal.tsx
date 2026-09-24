"use client"

import { useState, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  Copy, 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  AlertCircle,
  Shield
} from "lucide-react"
import { sendFounderInvitationAction } from "@/app/actions/founders"

interface InviteFounderModalProps {
  isOpen: boolean
  onClose: () => void
  publicCode: string | null
  founderNumber?: number | null
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  )
}

export function InviteFounderModal({
  isOpen,
  onClose,
  publicCode,
  founderNumber
}: InviteFounderModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isOpen || !isMounted) return null

  const baseUrl = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es")

  const referralUrl = publicCode ? `${baseUrl}/fundadores/r/${publicCode}` : `${baseUrl}/fundadores`

  const whatsappMessage = `Me gustaría invitarte a conocer Los 100 Arroceros Fundadores de misarroces.

Es un grupo limitado a los primeros arroceros que formen parte del proyecto y publiquen su primera receta mientras el acceso permanezca abierto.

Cuando se completen las plazas, el acceso se cerrará de forma definitiva.

Conoce Los 100 y cómo formar parte:
${referralUrl}`

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2200)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || isPending) return

    setErrorMessage(null)
    setEmailStatus("idle")

    startTransition(async () => {
      const res = await sendFounderInvitationAction(email)
      if (res.success) {
        setEmailStatus("success")
        setEmail("")
      } else {
        setEmailStatus("error")
        setErrorMessage(res.error || "No se pudo enviar la invitación.")
      }
    })
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 mb-5 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-[11px] font-black uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Los 100 Arroceros Fundadores</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Invitar a un arrocero
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Comparte tu invitación exclusiva con un apasionado del arroz antes de que se completen las 100 plazas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll si es pantalla pequeña */}
        <div className="overflow-y-auto space-y-4 pr-1 -mr-1">

          {/* OPCIÓN 1: WHATSAPP (BOTÓN DESTACADO) */}
          <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Enviar por WhatsApp</h3>
                  <p className="text-xs text-muted-foreground">Mensaje personalizado listo para enviar</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
              >
                <span>Abrir WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OPCIÓN 2: EMAIL DIRECTO OFICIAL */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Enviar por Email</h3>
                <p className="text-xs text-muted-foreground">Recibirá una invitación oficial en HTML responsive</p>
              </div>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2 mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amigo@correo.com"
                disabled={isPending}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isPending || !email.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </>
                )}
              </button>
            </form>

            {emailStatus === "success" && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>¡Invitación enviada con éxito! Revisa su bandeja de entrada.</span>
              </div>
            )}

            {emailStatus === "error" && errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* OPCIÓN 3: ACCIONES DE COPIADO RÁPIDO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs transition cursor-pointer active:scale-95"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-extrabold">¡Mensaje copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span>Copiar texto WhatsApp</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs transition cursor-pointer active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-extrabold">¡Enlace copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span>Copiar enlace personal</span>
                </>
              )}
            </button>
          </div>

          {/* PREVIEW DEL MENSAJE */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 text-left">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Vista previa del mensaje</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-mono bg-background/50 p-2.5 rounded-xl border border-border/50">
              {whatsappMessage}
            </p>
          </div>

          {/* NOTA DISCRETA OBLIGATORIA */}
          <p className="text-[11px] text-muted-foreground/80 leading-normal text-center pt-1 px-2">
            Esta invitación no reserva ni garantiza una plaza. El acceso se obtiene al cumplir las condiciones mientras permanezca abierto.
          </p>

        </div>
      </div>
    </div>,
    document.body
  )
}
