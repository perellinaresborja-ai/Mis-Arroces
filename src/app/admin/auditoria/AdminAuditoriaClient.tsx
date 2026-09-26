"use client"

import { useState, useMemo } from "react"
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Calendar,
  Eye,
  X,
  Terminal,
  User,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"

export interface AuditLogItem {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  details: any
  ipAddress: string | null
  createdAt: string
  admin: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
}

interface AdminAuditoriaClientProps {
  logs: AuditLogItem[]
}

export function AdminAuditoriaClient({ logs }: AdminAuditoriaClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)

  // Lista de acciones únicas presentes en los logs para el filtro
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort()
  }, [logs])

  // Filtrado
  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const q = searchTerm.toLowerCase().trim()
      if (q) {
        const matchesAction = l.action.toLowerCase().includes(q)
        const matchesAdmin = (l.admin?.username || "").toLowerCase().includes(q)
        const matchesTarget = (l.targetId || "").toLowerCase().includes(q) || (l.targetType || "").toLowerCase().includes(q)
        if (!matchesAction && !matchesAdmin && !matchesTarget) return false
      }

      if (actionFilter !== "ALL" && l.action !== actionFilter) return false

      return true
    })
  }, [logs, searchTerm, actionFilter])

  const getActionBadgeColor = (action: string) => {
    if (action.includes("SUSPEND") || action.includes("REVOKE") || action.includes("HIDE") || action.includes("DELETE")) {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    }
    if (action.includes("FOUNDER") || action.includes("PIN")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    }
    if (action.includes("CAMPAIGN") || action.includes("BROADCAST")) {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    }
    if (action.includes("REACTIVATE") || action.includes("PUBLISH") || action.includes("RESOLVED")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    }
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trazabilidad inmutable de todas las acciones ejecutadas por el equipo administrador en misarroces.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-border self-start sm:self-auto">
          Total eventos: <strong>{logs.length}</strong>
        </span>
      </div>

      {/* 2. Buscador y Filtros */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por acción, admin o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/40 border border-border/80 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs font-semibold self-start sm:self-auto"
        >
          <option value="ALL">Todas las acciones ({uniqueActions.length})</option>
          {uniqueActions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Tabla de Auditoría */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No hay registros de auditoría que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Administrador</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Objetivo</th>
                  <th className="p-4">Dirección IP</th>
                  <th className="p-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="p-4">
                      {log.admin ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-border">
                            <ProfileAvatar avatarUrl={log.admin.avatarUrl} username={log.admin.username} />
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            @{log.admin.username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sistema / API</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-xs font-mono text-muted-foreground max-w-[160px] truncate">
                      {log.targetType ? `${log.targetType}: ${log.targetId || "—"}` : "—"}
                    </td>

                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {log.ipAddress || "—"}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-card border border-border hover:bg-muted text-muted-foreground"
                      >
                        Ver JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Modal de Inspección de Detalles */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Registro de Auditoría</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-2xl border border-border/50">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Administrador
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedLog.admin ? `@${selectedLog.admin.username}` : "Sistema"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Fecha y Hora
                  </span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">
                  Acción y Objetivo
                </span>
                <p className="font-bold text-sm text-foreground mb-1">{selectedLog.action}</p>
                {selectedLog.targetType && (
                  <p className="text-muted-foreground font-mono text-xs">
                    {selectedLog.targetType} → {selectedLog.targetId}
                  </p>
                )}
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">
                  Payload de Detalles (JSON)
                </span>
                <div className="bg-zinc-950 text-zinc-300 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-56 border border-zinc-800">
                  <pre>{JSON.stringify(selectedLog.details || {}, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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
