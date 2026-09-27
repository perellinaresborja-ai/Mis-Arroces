"use client"

import { useState, useRef } from "react"
import { Share2, Download, Check, ShieldCheck, Trophy } from "lucide-react"

interface GiveawayShareCardProps {
  title: string
  prize: string
  winnerUsername: string
  winnerDisplayName: string
  winnerAvatarUrl?: string | null
  organizerUsername: string
  certificateCode: string
}

export function GiveawayShareCard({
  title,
  prize,
  winnerUsername,
  winnerDisplayName,
  winnerAvatarUrl,
  organizerUsername,
  certificateCode
}: GiveawayShareCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generar PNG en alta resolución (1080x1080 cuadrado o 1080x1350)
  const generatePngBlob = async (): Promise<Blob | null> => {
    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // 1. Fondo Crema cálido
    ctx.fillStyle = "#FBF9F4"
    ctx.fillRect(0, 0, 1080, 1080)

    // Borde exterior
    ctx.lineWidth = 16
    ctx.strokeStyle = "#EA580C"
    ctx.strokeRect(40, 40, 1000, 1000)

    // Fondo tarjeta interior
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.roundRect(70, 70, 940, 940, 36)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = "#E7E2D5"
    ctx.stroke()

    // 2. Encabezado de Marca
    ctx.textAlign = "center"
    ctx.font = "900 42px ui-sans-serif, system-ui, -apple-system"
    ctx.fillStyle = "#1C1917"
    ctx.fillText("mis", 500, 140)
    ctx.fillStyle = "#EA580C"
    ctx.fillText("arroces", 575, 140)

    // Badge Sorteo Finalizado
    ctx.fillStyle = "#EA580C"
    ctx.beginPath()
    ctx.roundRect(380, 165, 320, 44, 22)
    ctx.fill()
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "900 18px ui-sans-serif, system-ui"
    ctx.fillText("SORTEO FINALIZADO", 540, 194)

    // Título del Sorteo
    ctx.fillStyle = "#1C1917"
    ctx.font = "800 36px ui-sans-serif, system-ui"
    const displayTitle = title.length > 36 ? title.slice(0, 34) + "…" : title
    ctx.fillText(displayTitle, 540, 260)

    // 3. Avatar del Ganador
    const avatarSize = 160
    const avatarX = 540 - avatarSize / 2
    const avatarY = 300

    ctx.save()
    ctx.beginPath()
    ctx.arc(540, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, 2 * Math.PI)
    ctx.fillStyle = "#EA580C"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(540, avatarY + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
    ctx.clip()

    if (winnerAvatarUrl) {
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = winnerAvatarUrl
        })
        ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize)
      } catch {
        ctx.fillStyle = "#1C1917"
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "900 64px ui-sans-serif, system-ui"
        ctx.fillText(winnerUsername.replace(/^@/, "")[0]?.toUpperCase() || "G", 540, avatarY + 105)
      }
    } else {
      ctx.fillStyle = "#1C1917"
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "900 64px ui-sans-serif, system-ui"
      ctx.fillText(winnerUsername.replace(/^@/, "")[0]?.toUpperCase() || "G", 540, avatarY + 105)
    }
    ctx.restore()

    // 4. Datos del Ganador
    ctx.fillStyle = "#EA580C"
    ctx.font = "900 22px ui-sans-serif, system-ui"
    ctx.fillText("¡GANADOR OFICIAL!", 540, 505)

    ctx.fillStyle = "#1C1917"
    ctx.font = "900 38px ui-sans-serif, system-ui"
    ctx.fillText(winnerDisplayName || `@${winnerUsername.replace(/^@/, "")}`, 540, 555)

    ctx.fillStyle = "#78716C"
    ctx.font = "700 24px ui-sans-serif, system-ui"
    ctx.fillText(`@${winnerUsername.replace(/^@/, "")}`, 540, 595)

    // 5. Caja de Premio
    ctx.fillStyle = "#FDF6EC"
    ctx.beginPath()
    ctx.roundRect(140, 630, 800, 140, 24)
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#FDBA74"
    ctx.stroke()

    ctx.fillStyle = "#C2410C"
    ctx.font = "800 18px ui-sans-serif, system-ui"
    ctx.fillText("PREMIO ENTREGADO", 540, 665)

    ctx.fillStyle = "#1C1917"
    ctx.font = "800 28px ui-sans-serif, system-ui"
    const displayPrize = prize.length > 50 ? prize.slice(0, 48) + "…" : prize
    ctx.fillText(displayPrize, 540, 715)

    // 6. Pie con Organizador y Certificado
    ctx.fillStyle = "#44403C"
    ctx.font = "600 22px ui-sans-serif, system-ui"
    ctx.fillText(`Organizado por @${organizerUsername.replace(/^@/, "")}`, 540, 820)

    ctx.fillStyle = "#78716C"
    ctx.font = "700 20px ui-sans-serif, system-ui"
    ctx.fillText(`Certificado Oficial: ${certificateCode}`, 540, 865)

    // 7. Sello inferior
    ctx.fillStyle = "#16A34A"
    ctx.font = "800 17px ui-sans-serif, system-ui"
    ctx.fillText("✔ Resultado verificado y certificado por misarroces", 540, 930)

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"))
  }

  const handleShareCard = async () => {
    setSharing(true)
    try {
      const blob = await generatePngBlob()
      if (!blob) return

      const file = new File([blob], `sorteo-${certificateCode}.png`, { type: "image/png" })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Ganador del sorteo: ${title}`,
          text: `🎉 ¡Ganador oficial del sorteo en misarroces! Certificado: ${certificateCode}`,
          files: [file]
        })
        return
      }

      // Fallback: Descarga directa de la imagen
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sorteo-${certificateCode}.png`
      a.click()
      URL.revokeObjectURL(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.warn("Error sharing card:", e)
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadCard = async () => {
    const blob = await generatePngBlob()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sorteo-${certificateCode}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Vista previa bonita de la tarjeta en pantalla */}
      <div
        ref={cardRef}
        className="rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-card to-muted/20 p-5 sm:p-6 text-center space-y-4 shadow-md relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-3">
          <span className="font-extrabold text-foreground">
            mis<span className="text-primary">arroces</span>
          </span>
          <span className="font-black text-[10px] uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            SORTEO FINALIZADO
          </span>
        </div>

        <h4 className="font-black text-base sm:text-lg text-foreground truncate px-2">
          {title}
        </h4>

        {/* Ganador */}
        <div className="flex flex-col items-center space-y-2 py-1">
          <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border-2 border-primary shadow-md">
            {winnerAvatarUrl ? (
              <img
                src={winnerAvatarUrl}
                alt={winnerUsername}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary text-xl">
                {winnerUsername.replace(/^@/, "")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Ganador Oficial
            </span>
            <span className="font-extrabold text-sm text-foreground block">
              {winnerDisplayName || `@${winnerUsername.replace(/^@/, "")}`}
            </span>
            <span className="text-xs text-muted-foreground">
              @{winnerUsername.replace(/^@/, "")}
            </span>
          </div>
        </div>

        {/* Premio */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Premio
          </span>
          <span className="font-bold text-foreground truncate block mt-0.5">
            {prize}
          </span>
        </div>

        {/* Pie */}
        <div className="text-[11px] text-muted-foreground pt-1 space-y-0.5 border-t border-border/50">
          <div>Organizado por @{organizerUsername.replace(/^@/, "")}</div>
          <div className="font-mono font-bold text-foreground">
            Certificado: {certificateCode}
          </div>
          <div className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-[10px] pt-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Resultado certificado por misarroces</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleShareCard}
          disabled={sharing}
          className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? "¡Imagen guardada!" : "Compartir Tarjeta"}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCard}
          className="py-3 px-4 rounded-2xl bg-muted text-foreground font-bold text-xs border border-border hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5"
          title="Descargar imagen PNG"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Descargar PNG</span>
        </button>
      </div>
    </div>
  )
}
