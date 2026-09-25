"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Shield, X, Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShare } from "@/lib/platform"
import { InviteFounderModal } from "@/components/domain/InviteFounderModal"

interface FounderCardModalProps {
  username: string
  displayName: string | null
  founderNumber: number
  isSelf?: boolean
  publicCode?: string
}

export function FounderCardModal({
  username,
  displayName,
  founderNumber,
  isSelf = false,
  publicCode
}: FounderCardModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { share } = useShare()

  const formattedNumber = String(founderNumber).padStart(3, "0")
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es"
  const canonicalUrl = publicCode ? `${baseUrl}/id/${publicCode}` : `${baseUrl}/@${username}?id=founder`
  const referralUrl = publicCode ? `${baseUrl}/fundadores/r/${publicCode}` : `${baseUrl}/fundadores`
  const qrCodeUrl = `/api/qr/${publicCode || username}`

  const [copiedReferral, setCopiedReferral] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined" && isSelf) {
      const params = new URLSearchParams(window.location.search)
      if (
        params.get("id") === "founder" ||
        params.get("id") === "1" ||
        params.get("carnet") === "1" ||
        params.get("carnet") === "founder"
      ) {
        setIsOpen(true)
      }
    }
  }, [isSelf])

  const handleShare = () => {
    share(
      `ID de Arrocero Fundador #${formattedNumber}`,
      `¡Soy el Arrocero Fundador #${formattedNumber} de misarroces!`,
      canonicalUrl
    )
  }

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(canonicalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareReferral = () => {
    const text = `Te recomiendo para formar parte de Los 100 Arroceros Fundadores de misarroces.

Solo existirán 100. Cuando se completen, se cerrará para siempre.`
    share("Recomendación para Los 100 Arroceros Fundadores", text, referralUrl)
  }

  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(
        `Te recomiendo para formar parte de Los 100 Arroceros Fundadores de misarroces.\n\nSolo existirán 100. Cuando se completen, se cerrará para siempre.\n\n${referralUrl}`
      )
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    }
  }

  // En perfiles públicos/ajenos, mostrar únicamente la insignia sin "Ver ID" ni modal con QR
  if (!isSelf) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F5] text-[#18181B] rounded-full border border-[#E8E2D9] shadow-xs select-none"
        title={`Arrocero Fundador #${formattedNumber}`}
      >
        <Shield className="w-4 h-4 text-[#EA580C] shrink-0" />
        <span className="font-extrabold text-sm tracking-tight">Fundador #{formattedNumber}</span>
      </div>
    )
  }

  return (
    <>
      {/* Insignia interactiva exclusiva del propietario */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-white text-[#18181B] rounded-full border border-[#E8E2D9] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Ver mi ID de Fundador"
      >
        <Shield className="w-4 h-4 text-[#EA580C] shrink-0" />
        <span className="font-extrabold text-sm tracking-tight">Fundador #{formattedNumber}</span>
        <span className="text-[11px] font-bold text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded-full group-hover:bg-[#EA580C]/20 transition-colors">
          Ver mi ID
        </span>
      </button>

      {/* Modal del ID Fundador Vertical 2:3 */}
      {isOpen && isMounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[320px] bg-[#FAF8F5] text-[#18181B] border border-[#E8E2D9] rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-[#EA580C] tracking-wider uppercase">
                ID FUNDADOR
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-black/5 hover:bg-black/10 rounded-full text-zinc-500 hover:text-zinc-800 transition-colors"
                aria-label="Cerrar ID Fundador"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ID Vertical 2:3 Diseño Elevado */}
            <div className="w-[244px] mx-auto bg-[#FAF8F5] border-[1.5px] border-[#EA580C] rounded-[22px] p-[7px] shadow-sm text-center mb-4">
              <div className="border border-[#EAE3D7] rounded-[16px] p-3 bg-[#FDFBF7]">
                {/* Encabezado */}
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <img src="/logopngver.webp" alt="misarroces" className="w-[18px] h-[18px] object-contain" />
                  <span className="text-[15px] font-black tracking-tight text-[#18181B] leading-none">
                    mis<span className="text-[#EA580C]">arroces</span>
                  </span>
                </div>
                <div className="inline-block bg-white border border-[#EA580C] rounded-full px-2 py-0.5 text-[8px] font-extrabold text-[#EA580C] tracking-widest uppercase mb-2">
                  ARROCERO FUNDADOR
                </div>

                {/* Número protagonista */}
                <div className="text-4xl font-black tracking-tight text-[#18181B] leading-none mb-1 font-mono whitespace-nowrap">
                  <span className="text-[#18181B] text-3xl font-extrabold mr-0.5">#</span>{formattedNumber}
                </div>

                {/* @usuario */}
                <div className="text-[14px] font-extrabold text-[#18181B] truncate leading-tight mt-1 mb-1">
                  @{username}
                </div>

                <div className="inline-block bg-amber-50 border border-amber-200/80 rounded-full px-2 py-0.5 text-[7.5px] font-bold text-amber-800 tracking-wider uppercase mb-2">
                  ID personal e intransferible
                </div>

                {/* QR Centrado con marco */}
                <div className="bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm inline-block mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt={`QR Arrocero Fundador #${formattedNumber}`}
                    className="w-[96px] h-[96px] rounded-md block"
                    width={96}
                    height={96}
                  />
                </div>

                {/* Pie del ID con micro-sello */}
                <div className="border-t border-dashed border-[#E0D8CB] pt-1.5 mt-0.5">
                  <div className="text-[9px] font-extrabold text-[#18181B] tracking-widest uppercase leading-tight mb-0.5">
                    ✦ LOS 100 ✦
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 tracking-tight leading-tight">
                    misarroces
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleShare}
                className="w-full bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl text-xs h-9"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" /> Compartir ID
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full bg-white hover:bg-zinc-50 text-[#18181B] border-[#E8E2D9] font-bold rounded-xl text-xs h-9"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? "¡Copiado!" : "Copiar ID"}
              </Button>
            </div>

            {/* Recomienda a un arrocero */}
            {isSelf && (
              <div className="mt-4 pt-3.5 border-t border-[#EAE3D7] text-left">
                <div className="text-[12.5px] font-black text-[#18181B] mb-1 flex items-center justify-between">
                  <span>Recomienda a un arrocero</span>
                  <span className="text-[9px] font-extrabold text-[#EA580C] uppercase tracking-wider bg-[#EA580C]/10 px-2 py-0.5 rounded-full">
                    Exclusivo
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed mb-3">
                  Recomienda a otro arrocero para formar parte de Los 100. Comparte tu enlace personal antes de que se completen las plazas.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="w-full bg-[#18181B] hover:bg-black text-white font-bold rounded-xl text-xs h-8 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 mr-1.5 text-[#EA580C]" /> Recomendar
                  </Button>
                  <Button
                    onClick={handleCopyReferral}
                    variant="outline"
                    className="w-full bg-white hover:bg-zinc-50 text-[#18181B] border-[#E8E2D9] font-bold rounded-xl text-xs h-8 cursor-pointer"
                  >
                    {copiedReferral ? <Check className="w-3 h-3 mr-1.5 text-green-600" /> : <Copy className="w-3 h-3 mr-1.5" />}
                    {copiedReferral ? "¡Copiado!" : "Copiar enlace"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Invitación a un arrocero */}
      {isSelf && (
        <InviteFounderModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          publicCode={publicCode || null}
          founderNumber={founderNumber}
        />
      )}
    </>
  )
}
