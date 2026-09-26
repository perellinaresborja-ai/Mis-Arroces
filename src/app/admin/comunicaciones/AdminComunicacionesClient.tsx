"use client"

import { useState, useEffect } from "react"
import {
  BellRing,
  Send,
  Users,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  Calendar,
  ExternalLink,
  Crown,
  Briefcase,
  Check,
  RefreshCw,
} from "lucide-react"
import {
  AudienceFilters,
  getAudienceCount,
  sendAdminCampaign,
} from "@/app/actions/admin"

export interface CampaignHistoryItem {
  id: string
  title: string
  message: string
  channels: string[]
  segment: string
  recipientCount: number
  sentCount: number
  failedCount: number
  createdAt: string
  adminUsername: string
}

interface AdminComunicacionesClientProps {
  initialCampaigns: CampaignHistoryItem[]
  allUsersList: { id: string; username: string; displayName: string | null }[]
}

export function AdminComunicacionesClient({
  initialCampaigns,
  allUsersList,
}: AdminComunicacionesClientProps) {
  // Formulario
  const [channels, setChannels] = useState<("IN_APP" | "PUSH" | "EMAIL")[]>(["IN_APP"])
  const [segment, setSegment] = useState<AudienceFilters["segment"]>("ALL")
  const [manualUserIds, setManualUserIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")

  // Estado del recuento en tiempo real
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)

  // Previsualización y confirmación
  const [previewTab, setPreviewTab] = useState<"IN_APP" | "PUSH" | "EMAIL">("IN_APP")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    sentCount: number
    failedCount: number
    message?: string
  } | null>(null)

  // Historial
  const [campaigns, setCampaigns] = useState<CampaignHistoryItem[]>(initialCampaigns)

  // Recalcular recuento de destinatarios al cambiar filtros
  useEffect(() => {
    let isMounted = true
    setCountLoading(true)

    getAudienceCount({ segment, manualUserIds })
      .then((count) => {
        if (isMounted) setRecipientCount(count)
      })
      .catch(() => {
        if (isMounted) setRecipientCount(0)
      })
      .finally(() => {
        if (isMounted) setCountLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [segment, manualUserIds])

  const toggleChannel = (ch: "IN_APP" | "PUSH" | "EMAIL") => {
    if (channels.includes(ch)) {
      if (channels.length === 1) return // Debe quedar al menos uno
      setChannels(channels.filter((c) => c !== ch))
    } else {
      setChannels([...channels, ch])
    }
  }

  const handleSend = async () => {
    setSending(true)
    setSendResult(null)

    try {
      const res = await sendAdminCampaign({
        channels,
        filters: { segment, manualUserIds },
        title,
        message,
        subject: subject || title,
        ctaText: ctaText || undefined,
        ctaUrl: ctaUrl || undefined,
      })

      setSendResult({
        success: true,
        sentCount: res.sentCount,
        failedCount: res.failedCount,
      })

      // Añadir al historial visual
      const newCamp: CampaignHistoryItem = {
        id: `local-${Date.now()}`,
        title,
        message,
        channels,
        segment,
        recipientCount: res.recipientCount,
        sentCount: res.sentCount,
        failedCount: res.failedCount,
        createdAt: new Date().toISOString(),
        adminUsername: "Tú",
      }
      setCampaigns([newCamp, ...campaigns])
      setShowConfirmModal(false)

      // Limpiar formulario tras éxito
      setTitle("")
      setSubject("")
      setMessage("")
      setCtaText("")
      setCtaUrl("")
    } catch (err: any) {
      setSendResult({
        success: false,
        sentCount: 0,
        failedCount: 0,
        message: err.message || "Error al emitir campaña",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Centro de Comunicaciones</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Difusión multicanal: Notificaciones In-App, avisos Web Push y Email oficial vía Resend.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-border self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Canales operativos
        </span>
      </div>

      {/* Feedback general de emisión */}
      {sendResult && (
        <div
          className={`p-4 rounded-3xl border flex items-center gap-3 ${
            sendResult.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
          }`}
        >
          {sendResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <div className="text-xs font-semibold">
            {sendResult.success ? (
              <p>
                ¡Campaña emitida con éxito! Destinatarios procesados: <strong>{sendResult.sentCount}</strong>
                {sendResult.failedCount > 0 && ` (${sendResult.failedCount} fallidos)`}.
              </p>
            ) : (
              <p>Error en el envío: {sendResult.message}</p>
            )}
          </div>
        </div>
      )}

      {/* 2. Redactor de Campaña */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formulario (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          {/* Canales */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Canales de Distribución
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => toggleChannel("IN_APP")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  channels.includes("IN_APP")
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <BellRing className="w-4 h-4" />
                  {channels.includes("IN_APP") && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs block">In-App</span>
                <span className="text-[10px] opacity-75">Panel de avisos</span>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel("PUSH")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  channels.includes("PUSH")
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="w-4 h-4" />
                  {channels.includes("PUSH") && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs block">Web Push</span>
                <span className="text-[10px] opacity-75">Navegador/Móvil</span>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel("EMAIL")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  channels.includes("EMAIL")
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Mail className="w-4 h-4" />
                  {channels.includes("EMAIL") && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs block">Email</span>
                <span className="text-[10px] opacity-75">Vía Resend</span>
              </button>
            </div>
          </div>

          {/* Segmentación y Recuento Real */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Audiencia / Segmento
              </label>
              <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {countLoading ? "Calculando..." : `${recipientCount ?? 0} destinatarios reales`}
                </span>
              </div>
            </div>

            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as any)}
              className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Todos los usuarios registrados</option>
              <option value="FOUNDERS">Solo Arroceros Fundadores</option>
              <option value="NON_FOUNDERS">Usuarios no fundadores</option>
              <option value="PROFESSIONALS">Cuentas Profesionales (Todas)</option>
              <option value="PERSONAL">Cuentas Personales</option>
              <option value="CHEF">Profesionales · Chefs</option>
              <option value="RESTAURANT">Profesionales · Restaurantes</option>
              <option value="CREATOR">Profesionales · Creadores</option>
              <option value="BRAND">Profesionales · Marcas</option>
              <option value="PRODUCER">Profesionales · Productores</option>
              <option value="OTHER">Profesionales · Otros</option>
              <option value="ACTIVE_30D">Activos en los últimos 30 días</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="MANUAL">Selección manual individual</option>
            </select>

            {/* Selector manual si aplica */}
            {segment === "MANUAL" && (
              <div className="p-3 bg-muted/20 border border-border/60 rounded-2xl max-h-36 overflow-y-auto space-y-1 text-xs">
                {allUsersList.map((u) => {
                  const isChecked = manualUserIds.includes(u.id)
                  return (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setManualUserIds(manualUserIds.filter((id) => id !== u.id))
                          } else {
                            setManualUserIds([...manualUserIds, u.id])
                          }
                        }}
                        className="rounded border-border text-primary"
                      />
                      <span>@{u.username}</span>
                      {u.displayName && <span className="text-muted-foreground">({u.displayName})</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Campos de Mensaje */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Título del aviso / Encabezado
              </label>
              <input
                type="text"
                placeholder="Ej: Nuevo reto arrocero de temporada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {channels.includes("EMAIL") && (
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Asunto del Email
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡Descubre la nueva función de misarroces!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Mensaje principal
              </label>
              <textarea
                rows={4}
                placeholder="Escribe el cuerpo de la comunicación aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Enlace y botón CTA opcional */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Texto del botón CTA (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ver en misarroces"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  URL de destino (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: /recipes/mi-paella"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botón de Emisión */}
          <div className="pt-2">
            <button
              disabled={!title || !message || (recipientCount ?? 0) === 0}
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Emitir Campaña ({recipientCount ?? 0} destinatarios)</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa en Vivo (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" /> Vista Previa en Vivo
              </span>

              {/* Selector de canal de previsualización */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewTab("IN_APP")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    previewTab === "IN_APP" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  In-App
                </button>
                <button
                  onClick={() => setPreviewTab("PUSH")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    previewTab === "PUSH" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Push
                </button>
                <button
                  onClick={() => setPreviewTab("EMAIL")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    previewTab === "EMAIL" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Render según pestaña de preview */}
            {previewTab === "IN_APP" && (
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <BellRing className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block">
                      {title || "Título del aviso"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Ahora mismo</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {message || "El mensaje de la notificación aparecerá aquí..."}
                </p>
                {ctaText && (
                  <span className="text-[11px] font-bold text-primary block hover:underline">
                    {ctaText} →
                  </span>
                )}
              </div>
            )}

            {previewTab === "PUSH" && (
              <div className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl space-y-2 border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-white">
                      m
                    </span>
                    <span className="font-bold text-white">misarroces</span>
                  </div>
                  <span>Ahora</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{title || "Título de la notificación"}</h4>
                  <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">
                    {message || "Contenido del aviso push..."}
                  </p>
                </div>
              </div>
            )}

            {previewTab === "EMAIL" && (
              <div className="p-5 bg-white text-zinc-900 rounded-2xl shadow-sm border border-zinc-200 text-center space-y-3">
                <img
                  src="https://www.misarroces.es/logover.png"
                  alt="misarroces"
                  className="w-24 mx-auto"
                />
                <h3 className="font-black text-sm text-zinc-900">{title || "Título del correo"}</h3>
                <p className="text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed text-left">
                  {message || "Cuerpo estructurado del email..."}
                </p>
                {ctaText && (
                  <div className="pt-2">
                    <span className="inline-block bg-[#ea580c] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl uppercase tracking-wider">
                      {ctaText}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-100 text-[10px] text-zinc-400">
                  © 2026 misarroces.es · Comunicación oficial
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground bg-muted/20 p-3 rounded-2xl border border-border/50">
            Los envíos respetan automáticamente las preferencias individuales de notificación de cada arrocero.
          </div>
        </div>
      </div>

      {/* 3. Modal de Confirmación de Seguridad */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Confirmar Emisión</h3>
                <p className="text-xs text-muted-foreground">
                  Esta acción enviará la comunicación de forma inmediata.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinatarios:</span>
                <strong className="text-foreground">{recipientCount} arroceros</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canales:</span>
                <strong className="text-foreground">{channels.join(", ")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Segmento:</span>
                <strong className="text-foreground">{segment}</strong>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="text-muted-foreground block mb-0.5">Título:</span>
                <strong className="text-foreground">{title}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={sending}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-2xl bg-card border border-border text-xs font-bold hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                disabled={sending}
                onClick={handleSend}
                className="px-5 py-2 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Emitiendo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar y Enviar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Historial de Campañas */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Historial de Campañas Emitidas</span>
        </h3>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aún no se han emitido campañas desde Mi Admin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                    <th className="p-4">Campaña</th>
                    <th className="p-4">Segmento</th>
                    <th className="p-4">Canales</th>
                    <th className="p-4">Destinatarios</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4 text-right">Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 max-w-[220px]">
                        <strong className="text-foreground text-xs block truncate">{c.title}</strong>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          {c.message}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {c.segment}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-1 flex-wrap">
                          {c.channels.map((ch) => (
                            <span
                              key={ch}
                              className="text-[10px] font-black px-1.5 py-0.2 rounded bg-primary/10 text-primary"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-foreground">
                        {c.sentCount} / {c.recipientCount}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-xs text-right text-muted-foreground">
                        @{c.adminUsername}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
