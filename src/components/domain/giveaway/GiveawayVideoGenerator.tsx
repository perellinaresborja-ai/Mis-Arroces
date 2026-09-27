"use client"

import { useState, useRef, useEffect } from "react"
import QRCode from "qrcode"
import { Video, Share2, Download, AlertCircle, Loader2, RefreshCw, ShieldCheck, Check } from "lucide-react"

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
  const [generationPhase, setGenerationPhase] = useState<"idle" | "preparing" | "rendering" | "finalizing" | "ready">("idle")
  const [progress, setProgress] = useState(0)
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [formatType, setFormatType] = useState<"mp4" | "webm">("mp4")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isCancelledRef = useRef(false)
  const activeBlobUrlRef = useRef<string | null>(null)

  const cleanWinner = winnerUsername.replace(/^@/, "")
  const cleanOrganizer = organizerUsername.replace(/^@/, "")
  const certUrl = `https://www.misarroces.es/sorteos/${certificateCode}`

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      isCancelledRef.current = true
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
      }
    }
  }, [])

  // Dibuja un fotograma individual idéntico al diseño original
  const drawVideoFrame = (
    ctx: CanvasRenderingContext2D,
    frame: number,
    fps: number,
    totalFrames: number,
    avatarImg: HTMLImageElement | null,
    qrCanvas: HTMLCanvasElement,
    mockNames: string[]
  ) => {
    const timeSec = frame / fps

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
      ctx.fillText("✔ RESULTADO CERTIFICADO POR misarroces", 360, 880)
    }
  }

  // Generación principal del vídeo MP4 nativo mediante WebCodecs + mediabunny
  const handleGenerateVideo = async () => {
    setGenerating(true)
    setGenerationPhase("preparing")
    setProgress(0)
    setErrorMsg(null)
    isCancelledRef.current = false

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }
    setVideoBlobUrl(null)
    setVideoBlob(null)

    try {
      const width = 720
      const height = 1280
      const fps = 30
      const durationSec = 10
      const totalFrames = fps * durationSec

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) throw new Error("No se pudo inicializar el contexto gráfico 2D.")

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

      const mockNames = ["@cocina_arrocera", "@paellero_val", "@arroz_dop", "@sal_y_azafran", `@${cleanWinner}`]

      // 3. Comprobar soporte de WebCodecs + H.264
      let useWebCodecsMp4 = false
      let mb: typeof import("mediabunny") | null = null

      if (typeof window !== "undefined" && typeof (window as any).VideoEncoder !== "undefined") {
        try {
          // Carga dinámica de mediabunny bajo demanda (cero impacto en el bundle del feed inicial)
          mb = await import("mediabunny")
          const canAvc = await mb.canEncodeVideo("avc", {
            width,
            height,
            bitrate: 2500000,
            frameRate: fps
          })
          if (canAvc) {
            useWebCodecsMp4 = true
          }
        } catch (checkErr) {
          console.warn("WebCodecs H.264 check error:", checkErr)
          useWebCodecsMp4 = false
        }
      }

      // --- CAMINO A: WebCodecs + MP4 H.264 (VÍA PRINCIPAL) ---
      if (useWebCodecsMp4 && mb) {
        setFormatType("mp4")
        setGenerationPhase("rendering")

        const output = new mb.Output({
          target: new mb.BufferTarget(),
          format: new mb.Mp4OutputFormat({ fastStart: "in-memory" })
        })

        const videoSource = new mb.CanvasSource(canvas, {
          codec: "avc",
          bitrate: 2500000,
          keyFrameInterval: 2
        })

        output.addVideoTrack(videoSource)
        await output.start()

        for (let frame = 0; frame < totalFrames; frame++) {
          if (isCancelledRef.current) {
            await output.cancel()
            return
          }

          drawVideoFrame(ctx, frame, fps, totalFrames, avatarImg, qrCanvas, mockNames)
          const timeSec = frame / fps
          await videoSource.add(timeSec, 1 / fps)

          setProgress(Math.round(((frame + 1) / totalFrames) * 98))
        }

        setGenerationPhase("finalizing")
        await output.finalize()

        const targetBuffer = (output.target as any).buffer
        if (!targetBuffer) {
          throw new Error("No se pudo obtener el búfer binario del vídeo MP4.")
        }

        const mp4Blob = new Blob([targetBuffer], { type: "video/mp4" })
        const mp4Url = URL.createObjectURL(mp4Blob)
        activeBlobUrlRef.current = mp4Url
        setVideoBlob(mp4Blob)
        setVideoBlobUrl(mp4Url)
        setGenerationPhase("ready")
        setProgress(100)
        return
      }

      // --- CAMINO B: Fallback elegante con MediaRecorder (identificado honestamente como WebM) ---
      if (typeof window !== "undefined" && typeof (window as any).MediaRecorder !== "undefined") {
        setFormatType("webm")
        setGenerationPhase("rendering")

        // @ts-ignore
        const stream = canvas.captureStream ? canvas.captureStream(fps) : null
        if (!stream) {
          throw new Error("Este dispositivo no soporta captura de lienzo ni codificación nativa H.264.")
        }

        let mimeType = "video/webm"
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          mimeType = "video/webm;codecs=vp9"
        }

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2500000
        })

        const chunks: Blob[] = []
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data)
        }

        const recordingPromise = new Promise<Blob>((resolve, reject) => {
          recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: "video/webm" })
            resolve(finalBlob)
          }
          recorder.onerror = reject
        })

        recorder.start()

        for (let frame = 0; frame < totalFrames; frame++) {
          if (isCancelledRef.current) {
            recorder.stop()
            return
          }

          drawVideoFrame(ctx, frame, fps, totalFrames, avatarImg, qrCanvas, mockNames)
          setProgress(Math.round(((frame + 1) / totalFrames) * 98))
          await new Promise((r) => setTimeout(r, 1000 / fps))
        }

        setGenerationPhase("finalizing")
        recorder.stop()
        const webmBlob = await recordingPromise
        const webmUrl = URL.createObjectURL(webmBlob)
        activeBlobUrlRef.current = webmUrl
        setVideoBlob(webmBlob)
        setVideoBlobUrl(webmUrl)
        setGenerationPhase("ready")
        setProgress(100)
        return
      }

      throw new Error("Tu navegador no soporta grabación nativa de vídeo. Utiliza la tarjeta gráfica PNG 1080x1080.")
    } catch (err: any) {
      console.error("Error generating video:", err)
      setErrorMsg(err.message || "Error durante la generación del vídeo.")
      setGenerationPhase("idle")
    } finally {
      setGenerating(false)
    }
  }

  // Compartir vídeo con Web Share API (con archivo) o fallback a descarga
  const handleShareVideo = async () => {
    if (!videoBlobUrl || !videoBlob) return
    try {
      const ext = formatType === "mp4" ? "mp4" : "webm"
      const mime = formatType === "mp4" ? "video/mp4" : "video/webm"
      const fileName = `sorteo-${certificateCode}.${ext}`
      const file = new File([videoBlob], fileName, { type: mime })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Vídeo oficial del sorteo: ${title}`,
          text: `🎉 Comprueba el resultado del sorteo en misarroces. Certificado: ${certificateCode}`,
          files: [file]
        })
        return
      }

      // Fallback: descarga directa en el navegador
      const a = document.createElement("a")
      a.href = videoBlobUrl
      a.download = fileName
      a.click()
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.warn("Error sharing video:", e)
      }
    }
  }

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return
    const ext = formatType === "mp4" ? "mp4" : "webm"
    const a = document.createElement("a")
    a.href = videoBlobUrl
    a.download = `sorteo-${certificateCode}.${ext}`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Estado inicial */}
      {!videoBlobUrl && !generating && (
        <div className="p-5 rounded-3xl bg-muted/30 border border-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-foreground">
              Vídeo Oficial para Stories / Reels (MP4)
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Genera una pieza de vídeo vertical (9:16) en formato estándar MP4 H.264 con el ganador certificado y código QR verificable.
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
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
            <h4 className="font-black text-sm text-foreground tracking-wide">
              {generationPhase === "preparing" && "PREPARANDO VÍDEO…"}
              {generationPhase === "rendering" && "GENERANDO FOTOGRAMAS MP4 (H.264)…"}
              {generationPhase === "finalizing" && "FINALIZANDO ARCHIVO MP4…"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {generationPhase === "preparing" && "Inicializando lienzo y código QR verificable…"}
              {generationPhase === "rendering" && `Codificando vídeo vertical para Stories y Reels (${progress}%)`}
              {generationPhase === "finalizing" && "Empaquetando contenedor MP4 estándar con inicio rápido…"}
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
            <div className="flex items-center gap-1.5 font-extrabold text-foreground">
              {formatType === "mp4" ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Vídeo MP4 Oficial (H.264)</span>
                </>
              ) : (
                <span>Vídeo WebM Generado</span>
              )}
            </div>
            <span className="font-bold text-primary">Vertical 9:16</span>
          </div>

          {formatType === "webm" && (
            <div className="p-3 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs rounded-xl border border-amber-500/20 text-left">
              Tu navegador no soporta codificación nativa H.264 MP4; se ha generado en formato WebM (óptimo para WhatsApp y archivo personal). Para Instagram Stories se recomienda compartir la Tarjeta Oficial en Imagen (PNG 1080x1080).
            </div>
          )}

          {/* Reproductor preview */}
          <div className="relative mx-auto max-w-[240px] rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-black aspect-[9/16]">
            <video
              src={videoBlobUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleShareVideo}
              className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "¡Archivo guardado!" : "Compartir Vídeo"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadVideo}
              className="py-3 px-4 rounded-2xl bg-muted text-foreground font-bold text-xs border border-border hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateVideo}
              className="p-3 rounded-2xl bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
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
