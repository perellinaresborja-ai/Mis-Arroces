"use client"

import { useState, useMemo } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  Bug,
  Globe,
  Terminal,
  RefreshCw,
} from "lucide-react"
import { updateIncidentStatus } from "@/app/actions/admin"

export interface IncidentItem {
  id: string
  incidentType: string
  message: string
  stack: string | null
  url: string | null
  userAgent: string | null
  userId: string | null
  context: any
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED"
  createdAt: string
  resolvedAt: string | null
  resolvedByUsername: string | null
  user: {
    username: string
    displayName: string | null
  } | null
}

interface AdminIncidenciasClientProps {
  incidents: IncidentItem[]
}

export function AdminIncidenciasClient({ incidents }: AdminIncidenciasClientProps) {
  const [activeTab, setActiveTab] = useState<"OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED">("OPEN")
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Filtrado
  const filtered = useMemo(() => {
    return incidents.filter((i) => i.status === activeTab)
  }, [incidents, activeTab])

  // Contadores por estado
  const counts = useMemo(() => {
    return {
      OPEN: incidents.filter((i) => i.status === "OPEN").length,
      INVESTIGATING: incidents.filter((i) => i.status === "INVESTIGATING").length,
      RESOLVED: incidents.filter((i) => i.status === "RESOLVED").length,
      IGNORED: incidents.filter((i) => i.status === "IGNORED").length,
    }
  }, [incidents])

  const handleStatusChange = async (
    incident: IncidentItem,
    newStatus: "OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED"
  ) => {
    setActionLoading(true)
    try {
      await updateIncidentStatus(incident.id, newStatus)
      incident.status = newStatus
      if (selectedIncident?.id === incident.id) {
        setSelectedIncident({ ...incident, status: newStatus })
      }
    } catch (e: any) {
      alert(e.message || "Error al actualizar estado")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Incidencias Técnicas</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Telemetría y captura de errores de cliente/servidor en misarroces.
            </p>
          </div>
        </div>

        {counts.OPEN > 0 && (
          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 animate-pulse">
            <Bug className="w-4 h-4" />
            {counts.OPEN} abiertas
          </span>
        )}
      </div>

      {/* 2. Pestañas de Estado */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {(
          [
            { key: "OPEN", label: "Abiertas", count: counts.OPEN, color: "text-rose-500" },
            { key: "INVESTIGATING", label: "Investigando", count: counts.INVESTIGATING, color: "text-amber-500" },
            { key: "RESOLVED", label: "Resueltas", count: counts.RESOLVED, color: "text-emerald-500" },
            { key: "IGNORED", label: "Ignoradas", count: counts.IGNORED, color: "text-muted-foreground" },
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

      {/* 3. Listado */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <h3 className="font-bold text-base text-foreground">Sin incidencias en esta sección</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No hay registros con estado <strong>{activeTab}</strong>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className="p-4 sm:p-5 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-muted text-rose-600 dark:text-rose-400 border border-border">
                      {inc.incidentType}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inc.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-foreground line-clamp-1">{inc.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    {inc.url && (
                      <span className="flex items-center gap-1 truncate max-w-[240px]">
                        <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{inc.url}</span>
                      </span>
                    )}
                    {inc.user && (
                      <span>
                        Usuario: <strong>@{inc.user.username}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    <span>Detalle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Modal / Drawer de Detalle Técnico */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Incidencia Técnica</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-black bg-muted uppercase tracking-wider">
                      {selectedIncident.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">ID: {selectedIncident.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido técnico */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
                <span className="text-xs font-bold text-muted-foreground block">Mensaje de error</span>
                <p className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 break-words">
                  {selectedIncident.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-0.5">URL / Ruta</span>
                  <span className="font-mono text-foreground break-all">
                    {selectedIncident.url || "No especificada"}
                  </span>
                </div>

                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-0.5">Usuario afectado</span>
                  <span className="font-bold text-foreground">
                    {selectedIncident.user ? `@${selectedIncident.user.username}` : "Anónimo / No logueado"}
                  </span>
                </div>
              </div>

              {selectedIncident.userAgent && (
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-xs">
                  <span className="text-muted-foreground block mb-0.5">User Agent</span>
                  <span className="font-mono text-[11px] text-muted-foreground break-words">
                    {selectedIncident.userAgent}
                  </span>
                </div>
              )}

              {/* Stack trace */}
              {selectedIncident.stack && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Stack Trace
                  </span>
                  <div className="bg-zinc-950 text-zinc-300 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 border border-zinc-800 leading-relaxed">
                    <pre>{selectedIncident.stack}</pre>
                  </div>
                </div>
              )}

              {/* Context JSON */}
              {selectedIncident.context && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Contexto de ejecución
                  </span>
                  <div className="bg-zinc-950 text-zinc-300 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-36 border border-zinc-800">
                    <pre>{JSON.stringify(selectedIncident.context, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Acciones de cambio de estado */}
              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Cambiar Estado de la Incidencia
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedIncident.status !== "INVESTIGATING" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedIncident, "INVESTIGATING")}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                    >
                      Pasar a Investigando
                    </button>
                  )}

                  {selectedIncident.status !== "RESOLVED" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedIncident, "RESOLVED")}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      Marcar Resuelta
                    </button>
                  )}

                  {selectedIncident.status !== "IGNORED" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedIncident, "IGNORED")}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted border border-border text-muted-foreground hover:bg-muted/80"
                    >
                      Ignorar
                    </button>
                  )}

                  {selectedIncident.status !== "OPEN" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedIncident, "OPEN")}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted border border-border text-muted-foreground hover:bg-muted/80"
                    >
                      Reabrir
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-5 py-2 rounded-2xl bg-card border border-border text-xs font-bold hover:bg-muted"
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
