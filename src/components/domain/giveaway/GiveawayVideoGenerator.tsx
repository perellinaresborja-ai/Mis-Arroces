"use client"

import { useState, useRef, useEffect } from "react"
import QRCode from "qrcode"
import { Video, Share2, Download, Check, AlertCircle, Loader2, Play, RefreshCw, ShieldCheck } from "lucide-react"

interface GiveawayVideoGeneratorProps {
  title: string
  prize: string
  winnerUsername: string
  winnerDisplayName: string
  winnerAvatarUrl?: string | null
  organizerUsername: string
  certificateCode: string
}

export function GiveawayVideoGenerator({
  title,
  prize,
  winnerUsername,
  winnerDisplayName,
  winnerAvatarUrl,
  organizerUsername,
  certificateCode
}: GiveawayVideoGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null)
  const [videoMimeType, setVideoMimeType] = useState<string>("video/mp4")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const cleanWinner = winnerUsername.replace(/^@/, "")
  const cleanOrganizer = organizerUsername.replace(/^@/, "")
  const certUrl = `https://www.misarroces.es/sorteos/${certificateCode}`

  // Generar vídeo 9:16 (720x1280 a 30 FPS durante 10 segundos)
  const handleGenerateVideo = async () => {
    setGenerating(true)
    setProgress(0)
    setErrorMsg(null)
    setVideoBlobUrl(null)

    if (typeof window === "undefined" || !window.MediaRecorder) {
      setErrorMsg("Tu navegador no soporta grabación nativa de vídeo. Puedes usar la tarjeta compartible en imagen.")
      setGenerating(false)
      return
    }

    try {
      const canvas = document.createElement("canvas")
      canvas.width = 720
      canvas.height = 1280
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("No se pudo inicializar el lienzo gráfico.")

      // 1. Cargar imagen de avatar si existe
      let avatarImg: HTMLImageElement | null = null
      if (winnerAvatarUrl) {
        try {
          avatarImg = new Image()
          avatarImg.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            avatarImg!.onload = resolve
            avatarImg!.onerror = reject
            avatarImg!.src = winnerAvatarUrl
          })
        } catch {
          avatarImg = null
        }
      }

      // 2. Generar QR oficial para el frame final
      const qrCanvas = document.createElement("canvas")
      await QRCode.toCanvas(qrCanvas, certUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#1C1917",
          light: "#FFFFFF"
        }
      })

      // 3. Detectar formato soportado (MP4 o WebM)
      let mimeType = "video/webm"
      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
        mimeType = "video/mp4;codecs=avc1"
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4"
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9"
      }
      setVideoMimeType(mimeType.includes("mp4") ? "video/mp4" : "video/webm")

      // 4. Iniciar stream y grabadora
      const fps = 30
      const durationSec = 10
      const totalFrames = fps * durationSec

      // @ts-ignore
      const stream = canvas.captureStream ? canvas.captureStream(fps) : null
      if (!stream) {
        throw new Error("canvas.captureStream no está disponible en este dispositivo.")
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps de alta fidelidad
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      const recordingFinishedPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const finalBlob = new Blob(chunks, { type: mimeType.split(";")[0] })
          resolve(finalBlob)
        }
        recorder.onerror = reject
      })

      recorder.start()

      // 5. Renderizar los cuadros a velocidad controlada
      // Secuencia:
      // 0–2s (frames 0–60): Introducción
      // 2–5.5s (frames 60–165): Tensión / Ruleta de nombres
      // 5.5–8s (frames 165–240): Revelación del ganador
      // 8–10s (frames 240–300): Certificado y QR
      const mockNames = ["@cocina_arrocera", "@paellero_val", "@arroz_dop", "@sal_y_azafran", `@${cleanWinner}`]

      for (let frame = 0; frame < totalFrames; frame++) {
        const timeSec = frame / fps
        setProgress(Math.round((frame / totalFrames) * 100))

        // Fondo base crema suave
        ctx.fillStyle = "#FBF9F4"
        ctx.fillRect(0, 0, 720, 1280)

        // Borde exterior naranja arrocero
        ctx.lineWidth = 14
        ctx.strokeStyle = "#EA580C"
        ctx.strokeRect(20, 20, 680, 1240)

        // Cabecera superior fija
        ctx.textAlign = "center"
        ctx.font = "900 36px ui-sans-serif, system-ui"
        ctx.fillStyle = "#1C1917"
        ctx.fillText("mis", 325, 90)
        ctx.fillStyle = "#EA580C"
        ctx.fillText("arroces", 395, 90)

        // Badge Sorteo Certificado
        ctx.fillStyle = "#EA580C"
        ctx.beginPath()
        ctx.roundRect(240, 115, 240, 36, 18)
        ctx.fill()
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "900 15px ui-sans-serif, system-ui"
        ctx.fillText("SORTEO CERTIFICADO", 360, 139)

        // Título del sorteo
        ctx.fillStyle = "#1C1917"
        ctx.font = "800 28px ui-sans-serif, system-ui"
        const displayTitle = title.length > 30 ? title.slice(0, 28) + "…" : title
        ctx.fillText(displayTitle, 360, 200)

        // FASE 1: 0 - 2s (Intro)
        if (timeSec < 2) {
          ctx.fillStyle = "#78716C"
          ctx.font = "700 24px ui-sans-serif, system-ui"
          ctx.fillText("Sorteo Oficial", 360, 520)

          ctx.fillStyle = "#EA580C"
          ctx.font = "900 48px ui-sans-serif, system-ui"
          ctx.fillText("¿Quién se lo lleva?", 360, 600)

          ctx.fillStyle = "#1C1917"
          ctx.font = "800 22px ui-sans-serif, system-ui"
          ctx.fillText(`Premio: ${prize}`, 360, 680)
        }

        // FASE 2: 2 - 5.5s (Tensión / Ruleta de participantes)
        else if (timeSec < 5.5) {
          ctx.fillStyle = "#EA580C"
          ctx.font = "900 26px ui-sans-serif, system-ui"
          ctx.fillText("SELECCIONANDO GANADOR...", 360, 360)

          // Marco de nombres girando
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.roundRect(100, 420, 520, 380, 32)
          ctx.fill()
          ctx.lineWidth = 4
          ctx.strokeStyle = "#EA580C"
          ctx.stroke()

          // Nombre animado
          const nameIndex = Math.floor((frame * 1.5) % mockNames.length)
          const currentMockName = timeSec > 4.5 ? `@${cleanWinner}` : mockNames[nameIndex]

          ctx.fillStyle = timeSec > 4.8 ? "#EA580C" : "#1C1917"
          ctx.font = "900 42px ui-sans-serif, system-ui"
          ctx.fillText(currentMockName, 360, 620)

          ctx.fillStyle = "#78716C"
          ctx.font = "600 18px ui-sans-serif, system-ui"
          ctx.fillText("Cálculo criptográfico seguro", 360, 720)
        }

        // FASE 3: 5.5 - 8s (Ganador Revelado)
        else if (timeSec < 8) {
          ctx.fillStyle = "#EA580C"
          ctx.font = "900 32px ui-sans-serif, system-ui"
          ctx.fillText("🎉 ¡TENEMOS GANADOR! 🎉", 360, 320)

          // Avatar circular
          const avSize = 180
          const avX = 360 - avSize / 2
          const avY = 380

          ctx.save()
          ctx.beginPath()
          ctx.arc(360, avY + avSize / 2, avSize / 2 + 8, 0, 2 * Math.PI)
          ctx.fillStyle = "#EA580C"
          ctx.fill()
          ctx.beginPath()
          ctx.arc(360, avY + avSize / 2, avSize / 2, 0, 2 * Math.PI)
          ctx.clip()

          if (avatarImg) {
            ctx.drawImage(avatarImg, avX, avY, avSize, avSize)
          } else {
            ctx.fillStyle = "#1C1917"
            ctx.fillRect(avX, avY, avSize, avSize)
            ctx.fillStyle = "#FFFFFF"
            ctx.font = "900 72px ui-sans-serif, system-ui"
            ctx.fillText(cleanWinner[0]?.toUpperCase() || "G", 360, avY + 115)
          }
          ctx.restore()

          // Nombre y usuario del ganador
          ctx.fillStyle = "#1C1917"
          ctx.font = "900 40px ui-sans-serif, system-ui"
          ctx.fillText(winnerDisplayName || `@${cleanWinner}`, 360, 630)

          ctx.fillStyle = "#EA580C"
          ctx.font = "800 28px ui-sans-serif, system-ui"
          ctx.fillText(`@${cleanWinner}`, 360, 680)

          // Caja de Premio
          ctx.fillStyle = "#FDF6EC"
          ctx.beginPath()
          ctx.roundRect(80, 740, 560, 130, 24)
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = "#FDBA74"
          ctx.stroke()

          ctx.fillStyle = "#C2410C"
          ctx.font = "800 17px ui-sans-serif, system-ui"
          ctx.fillText("PREMIO OFICIAL", 360, 780)

          ctx.fillStyle = "#1C1917"
          ctx.font = "800 24px ui-sans-serif, system-ui"
          const displayPrize = prize.length > 36 ? prize.slice(0, 34) + "…" : prize
          ctx.fillText(displayPrize, 360, 830)
        }

        // FASE 4: 8 - 10s (Certificado + QR Escaneable)
        else {
          ctx.fillStyle = "#1C1917"
          ctx.font = "900 32px ui-sans-serif, system-ui"
          ctx.fillText("¡Enhorabuena!", 360, 290)

          ctx.fillStyle = "#EA580C"
          ctx.font = "900 36px ui-sans-serif, system-ui"
          ctx.fillText(`@${cleanWinner}`, 360, 340)

          // Marco del QR
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.roundRect(240, 420, 240, 240, 28)
          ctx.fill()
          ctx.lineWidth = 4
          ctx.strokeStyle = "#EA580C"
          ctx.stroke()

          // Dibujar el QR real generado
          ctx.drawImage(qrCanvas, 270, 450, 180, 180)

          ctx.fillStyle = "#1C1917"
          ctx.font = "800 19px ui-sans-serif, system-ui"
          ctx.fillText("ESCANEA PARA VERIFICAR", 360, 710)

          ctx.fillStyle = "#78716C"
          ctx.font = "700 22px ui-sans-serif, system-ui"
          ctx.fillText(`Certificado: ${certificateCode}`, 360, 760)

          ctx.fillStyle = "#44403C"
          ctx.font = "600 20px ui-sans-serif, system-ui"
          ctx.fillText(`Organizado por @${cleanOrganizer}`, 360, 810)

          ctx.fillStyle = "#16A34A"
          ctx.font = "800 17px ui-sans-serif, system-ui"
          ctx.fillText("✔ RESULTADO CERTIFICADO POR MISARROCES", 360, 880)
        }

        // Breve pausa para dar tiempo al encoder
        await new Promise((r) => setTimeout(r, 1000 / fps))
      }

      recorder.stop()
      const recordedBlob = await recordingFinishedPromise
      const finalUrl = URL.createObjectURL(recordedBlob)
      setVideoBlobUrl(finalUrl)
      setProgress(100)
    } catch (err: any) {
      console.error("Error generating video:", err)
      setErrorMsg(err.message || "Error durante la generación del vídeo.")
    } finally {
      setGenerating(false)
    }
  }

  // Compartir vídeo con Web Share API (con archivo) o fallback a descarga
  const handleShareVideo = async () => {
    if (!videoBlobUrl) return
    try {
      const res = await fetch(videoBlobUrl)
      const blob = await res.blob()
      const ext = videoMimeType.includes("mp4") ? "mp4" : "webm"
      const file = new File([blob], `sorteo-${certificateCode}.${ext}`, { type: blob.type })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Vídeo del sorteo ${title}`,
          text: `🎉 Comprueba el resultado del sorteo en misarroces. Certificado: ${certificateCode}`,
          files: [file]
        })
        return
      }

      // Fallback descarga directa
      const a = document.createElement("a")
      a.href = videoBlobUrl
      a.download = `sorteo-${certificateCode}.${ext}`
      a.click()
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.warn("Error sharing video:", e)
    }
  }

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return
    const ext = videoMimeType.includes("mp4") ? "mp4" : "webm"
    const a = document.createElement("a")
    a.href = videoBlobUrl
    a.download = `sorteo-${certificateCode}.${ext}`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Botón inicial o estado */}
      {!videoBlobUrl && !generating && (
        <div className="p-5 rounded-3xl bg-muted/30 border border-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-foreground">
              Vídeo Oficial para Stories / Reels
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Genera una pieza de vídeo vertical (9:16) de 10 segundos con el ganador certificado y código QR verificable.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateVideo}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Generar Vídeo Oficial (9:16)</span>
          </button>
        </div>
      )}

      {/* Barra de progreso durante la generación */}
      {generating && (
        <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm animate-in fade-in duration-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="font-black text-sm text-foreground">
              PREPARANDO TU VÍDEO
            </h4>
            <p className="text-xs text-muted-foreground">
              Renderizando fotogramas y QR oficial escaneable ({progress}%)
            </p>
          </div>

          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Reproductor y acciones tras generar el vídeo */}
      {videoBlobUrl && (
        <div className="p-5 rounded-3xl bg-card border-2 border-primary/30 text-center space-y-4 shadow-md animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
            <span className="font-extrabold text-foreground">Vídeo Oficial Generado</span>
            <span className="font-bold text-primary">Vertical 9:16</span>
          </div>

          {/* Reproductor preview */}
          <div className="relative mx-auto max-w-[240px] rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-black aspect-[9/16]">
            <video
              src={videoBlobUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleShareVideo}
              className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "¡Vídeo guardado!" : "Compartir Vídeo"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadVideo}
              className="py-3 px-4 rounded-2xl bg-muted text-foreground font-bold text-xs border border-border hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateVideo}
              className="p-3 rounded-2xl bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
              title="Regenerar vídeo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
