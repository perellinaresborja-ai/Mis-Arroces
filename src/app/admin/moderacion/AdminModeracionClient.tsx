"use client"

import { useState, useMemo } from "react"
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Clock,
  User,
  UtensilsCrossed,
  Image as ImageIcon,
  MessageSquare,
  Radio,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import {
  reviewModerationReport,
  dismissModerationReport,
  actionModerationReport,
} from "@/app/actions/admin"

export interface ModerationReportItem {
  id: string
  targetType: string
  targetId: string
  reason: string
  details: string | null
  contentSnapshot: any
  status: "PENDING" | "REVIEWED" | "ACTIONED" | "DISMISSED"
  createdAt: string
  reviewedAt: string | null
  reporter: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  reportedUser: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
}

interface AdminModeracionClientProps {
  reports: ModerationReportItem[]
  currentAdminRole: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
}

export function AdminModeracionClient({
  reports,
  currentAdminRole,
}: AdminModeracionClientProps) {
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEWED" | "ACTIONED" | "DISMISSED">("PENDING")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [selectedReport, setSelectedReport] = useState<ModerationReportItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  // Filtrado
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.status !== activeTab) return false
      if (typeFilter !== "ALL" && r.targetType !== typeFilter) return false
      return true
    })
  }, [reports, activeTab, typeFilter])

  // Contadores por estado
  const counts = useMemo(() => {
    return {
      PENDING: reports.filter((r) => r.status === "PENDING").length,
      REVIEWED: reports.filter((r) => r.status === "REVIEWED").length,
      ACTIONED: reports.filter((r) => r.status === "ACTIONED").length,
      DISMISSED: reports.filter((r) => r.status === "DISMISSED").length,
    }
  }, [reports])

  const handleReview = async (reportId: string) => {
    setActionLoading(true)
    setActionMessage(null)
    try {
      await reviewModerationReport(reportId)
      if (selectedReport) selectedReport.status = "REVIEWED"
      setActionMessage({ text: "Reporte marcado como revisado", type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al revisar", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDismiss = async (reportId: string) => {
    if (!confirm("¿Deseas desestimar esta denuncia sin aplicar sanciones?")) return
    setActionLoading(true)
    setActionMessage(null)
    try {
      await dismissModerationReport(reportId)
      if (selectedReport) selectedReport.status = "DISMISSED"
      setActionMessage({ text: "Reporte desestimado", type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al desestimar", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAction = async (
    report: ModerationReportItem,
    actionType: "HIDE_CONTENT" | "SUSPEND_USER" | "WARN_USER"
  ) => {
    const actionLabel =
      actionType === "HIDE_CONTENT"
        ? "ocultar/retirar el contenido denunciado"
        : actionType === "SUSPEND_USER"
        ? `suspender la cuenta del usuario @${report.reportedUser?.username || "denunciado"}`
        : "emitir advertencia"

    if (!confirm(`¿Confirmas aplicar la medida: ${actionLabel}?`)) return

    setActionLoading(true)
    setActionMessage(null)
    try {
      await actionModerationReport(
        report.id,
        actionType,
        report.targetType,
        actionType === "SUSPEND_USER" ? (report.reportedUser?.id || report.targetId) : report.targetId
      )
      report.status = "ACTIONED"
      setSelectedReport({ ...report, status: "ACTIONED" })
      setActionMessage({ text: "Medida correctiva aplicada con éxito", type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al accionar", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "RECIPE":
        return <UtensilsCrossed className="w-4 h-4 text-primary" />
      case "POST":
        return <ImageIcon className="w-4 h-4 text-amber-500" />
      case "STORY":
        return <Radio className="w-4 h-4 text-rose-500" />
      case "USER":
        return <User className="w-4 h-4 text-blue-500" />
      case "COMMENT":
      case "COMMENT_REPLY":
      case "MESSAGE":
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getTargetUrl = (type: string, id: string) => {
    switch (type) {
      case "RECIPE":
        return `/recipes/${id}`
      case "POST":
        return `/posts/${id}`
      case "USER":
        return `/${id}`
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Moderación y Reportes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bandeja de denuncias de usuarios y notificaciones legales de contenido (DSA).
            </p>
          </div>
        </div>

        {counts.PENDING > 0 && (
          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            {counts.PENDING} {counts.PENDING === 1 ? "reporte pendiente" : "reportes pendientes"}
          </span>
        )}
      </div>

      {/* 2. Pestañas de estado y selector de tipo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "PENDING", label: "Pendientes", count: counts.PENDING },
              { key: "REVIEWED", label: "Revisados", count: counts.REVIEWED },
              { key: "ACTIONED", label: "Accionados", count: counts.ACTIONED },
              { key: "DISMISSED", label: "Descartados", count: counts.DISMISSED },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : tab.count > 0
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="RECIPE">Recetas</option>
            <option value="POST">Publicaciones</option>
            <option value="STORY">Stories</option>
            <option value="USER">Usuarios</option>
            <option value="COMMENT">Comentarios</option>
          </select>
        </div>
      </div>

      {/* 3. Listado de reportes */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <h3 className="font-bold text-base text-foreground">Bandeja despejada</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No hay denuncias con estado <strong>{activeTab}</strong> para el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 sm:p-5 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-muted border border-border shrink-0 mt-0.5">
                    {getTargetIcon(report.targetType)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-black px-2 py-0.5 rounded-md bg-muted uppercase tracking-wider text-[10px]">
                        {report.targetType}
                      </span>
                      <span className="font-bold text-foreground">Motivo: {report.reason}</span>
                    </div>

                    {report.details && (
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "{report.details}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 flex-wrap">
                      <span>
                        Denunciante:{" "}
                        <strong className="text-foreground">
                          {report.reporter ? `@${report.reporter.username}` : "Anónimo"}
                        </strong>
                      </span>
                      <span>·</span>
                      {report.reportedUser && (
                        <>
                          <span>
                            Denunciado:{" "}
                            <strong className="text-foreground">@{report.reportedUser.username}</strong>
                          </span>
                          <span>·</span>
                        </>
                      )}
                      <span>
                        {new Date(report.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    <span>Inspeccionar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Modal / Drawer de Detalle del Reporte */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {getTargetIcon(selectedReport.targetType)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Expediente de Moderación</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-black bg-muted uppercase tracking-wider">
                      {selectedReport.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">ID: {selectedReport.id}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedReport(null)
                  setActionMessage(null)
                }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes feedback */}
            {actionMessage && (
              <div
                className={`p-3 text-xs font-semibold text-center border-b ${
                  actionMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            {/* Contenido */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Motivo y explicación */}
              <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Motivo declarado
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(selectedReport.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
                <p className="font-bold text-sm text-foreground">{selectedReport.reason}</p>
                {selectedReport.details && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap pt-1 border-t border-border/40">
                    {selectedReport.details}
                  </p>
                )}
              </div>

              {/* Usuarios involucrados */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-1">Denunciante</span>
                  {selectedReport.reporter ? (
                    <Link
                      href={`/@${selectedReport.reporter.username}`}
                      target="_blank"
                      className="font-bold text-foreground hover:underline flex items-center gap-1.5"
                    >
                      <ProfileAvatar
                        avatarUrl={selectedReport.reporter.avatarUrl}
                        username={selectedReport.reporter.username}
                      />
                      <span>@{selectedReport.reporter.username}</span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground italic">Anónimo / Sistema</span>
                  )}
                </div>

                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-1">Usuario Denunciado</span>
                  {selectedReport.reportedUser ? (
                    <Link
                      href={`/@${selectedReport.reportedUser.username}`}
                      target="_blank"
                      className="font-bold text-foreground hover:underline flex items-center gap-1.5"
                    >
                      <ProfileAvatar
                        avatarUrl={selectedReport.reportedUser.avatarUrl}
                        username={selectedReport.reportedUser.username}
                      />
                      <span>@{selectedReport.reportedUser.username}</span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground italic">No especificado</span>
                  )}
                </div>
              </div>

              {/* Snapshot de contenido o enlace directo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Evidencia / Contenido denunciado
                  </span>
                  {getTargetUrl(selectedReport.targetType, selectedReport.targetId) && (
                    <Link
                      href={getTargetUrl(selectedReport.targetType, selectedReport.targetId)!}
                      target="_blank"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Abrir contenido original</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {selectedReport.contentSnapshot ? (
                  <div className="bg-zinc-950 text-zinc-300 p-3.5 rounded-2xl text-xs font-mono overflow-x-auto max-h-48 border border-zinc-800">
                    <pre>{JSON.stringify(selectedReport.contentSnapshot, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="bg-muted/20 border border-border/50 p-4 rounded-2xl text-xs text-muted-foreground text-center">
                    No se capturó snapshot estático en el momento de la denuncia. Consulta el enlace directo.
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Resolución del Expediente
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedReport.status === "PENDING" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReview(selectedReport.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-muted border border-border hover:bg-muted/80 text-foreground"
                    >
                      Marcar Revisado
                    </button>
                  )}

                  {selectedReport.status !== "DISMISSED" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleDismiss(selectedReport.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-muted border border-border hover:bg-muted/80 text-muted-foreground"
                    >
                      Desestimar Reporte
                    </button>
                  )}

                  {selectedReport.status !== "ACTIONED" && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAction(selectedReport, "HIDE_CONTENT")}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                      >
                        Retirar / Ocultar Contenido
                      </button>

                      {selectedReport.reportedUser && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAction(selectedReport, "SUSPEND_USER")}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                        >
                          Suspender Usuario
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null)
                  setActionMessage(null)
                }}
                className="px-5 py-2 rounded-2xl bg-card border border-border text-xs font-bold hover:bg-muted transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
