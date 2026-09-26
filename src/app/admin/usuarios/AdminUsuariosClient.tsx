"use client"

import { useState, useMemo } from "react"
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Crown,
  Briefcase,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ExternalLink,
  Calendar,
  Mail,
  UtensilsCrossed,
  Flame,
  Image as ImageIcon,
  ChevronRight,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import {
  updateUserAccountStatus,
  updateUserAccountType,
  setUserAdminRole,
} from "@/app/actions/admin"

export interface AdminUserItem {
  id: string
  username: string
  displayName: string | null
  email: string | null
  createdAt: string
  accountStatus: "ACTIVE" | "SUSPENDED" | string
  accountType: "PERSONAL" | "PROFESSIONAL" | string
  professionalType: string | null
  founderNumber: number | null
  adminRole: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | null
  avatarUrl: string | null
  recipesCount: number
  postsCount: number
  sessionsCount: number
}

interface AdminUsuariosClientProps {
  users: AdminUserItem[]
  currentAdminRole: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
}

export function AdminUsuariosClient({
  users,
  currentAdminRole,
}: AdminUsuariosClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [specialFilter, setSpecialFilter] = useState<string>("ALL")
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  // Filtrado reactivo en cliente
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Buscador
      const q = searchTerm.toLowerCase().trim()
      if (q) {
        const matchesUsername = u.username.toLowerCase().includes(q)
        const matchesName = (u.displayName || "").toLowerCase().includes(q)
        const matchesEmail = (u.email || "").toLowerCase().includes(q)
        if (!matchesUsername && !matchesName && !matchesEmail) return false
      }

      // 2. Filtro de estado
      if (statusFilter !== "ALL" && u.accountStatus !== statusFilter) {
        return false
      }

      // 3. Filtro de tipo de cuenta
      if (typeFilter === "PERSONAL" && u.accountType !== "PERSONAL") return false
      if (typeFilter === "PROFESSIONAL" && u.accountType !== "PROFESSIONAL") return false
      if (["CHEF", "RESTAURANT", "CREATOR", "BRAND", "PRODUCER", "OTHER"].includes(typeFilter)) {
        if (u.accountType !== "PROFESSIONAL" || u.professionalType !== typeFilter) return false
      }

      // 4. Especiales (Fundador / Admin / Orgánicos)
      if (specialFilter === "FOUNDER" && u.founderNumber === null) return false
      if (specialFilter === "ADMIN" && !u.adminRole) return false
      if (specialFilter === "ORGANIC") {
        const testUsernames = ["testuser83402", "paellaloversclub", "misarroces2"]
        if (testUsernames.includes(u.username.toLowerCase())) return false
      }

      return true
    })
  }, [users, searchTerm, statusFilter, typeFilter, specialFilter])

  // Contadores rápidos
  const totalCount = users.length
  const activeCount = users.filter((u) => u.accountStatus === "ACTIVE").length
  const suspendedCount = users.filter((u) => u.accountStatus === "SUSPENDED").length
  const professionalCount = users.filter((u) => u.accountType === "PROFESSIONAL").length
  const foundersCount = users.filter((u) => u.founderNumber !== null).length

  // Ejecución de acciones
  const handleToggleStatus = async (user: AdminUserItem) => {
    const newStatus = user.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const confirmText =
      newStatus === "SUSPENDED"
        ? `¿Estás seguro de suspender la cuenta de @${user.username}? No podrá iniciar sesión ni publicar.`
        : `¿Reactivar la cuenta de @${user.username}?`

    if (!confirm(confirmText)) return

    setActionLoading(true)
    setActionMessage(null)
    try {
      await updateUserAccountStatus(user.id, newStatus)
      user.accountStatus = newStatus
      setSelectedUser({ ...user, accountStatus: newStatus })
      setActionMessage({ text: `Estado actualizado a ${newStatus}`, type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al actualizar", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleAccountType = async (user: AdminUserItem, newType: "PERSONAL" | "PROFESSIONAL", profType?: string) => {
    setActionLoading(true)
    setActionMessage(null)
    try {
      await updateUserAccountType(user.id, newType, profType || null)
      user.accountType = newType
      user.professionalType = newType === "PROFESSIONAL" ? (profType || "CHEF") : null
      setSelectedUser({ ...user, accountType: newType, professionalType: user.professionalType })
      setActionMessage({ text: "Tipo de cuenta actualizado", type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al actualizar", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAdminRoleChange = async (user: AdminUserItem, newRole: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "NONE") => {
    if (!confirm(`¿Confirmas asignar el rol "${newRole}" a @${user.username}?`)) return

    setActionLoading(true)
    setActionMessage(null)
    try {
      await setUserAdminRole(user.id, newRole)
      user.adminRole = newRole === "NONE" ? null : newRole
      setSelectedUser({ ...user, adminRole: user.adminRole })
      setActionMessage({ text: "Rol administrativo actualizado", type: "success" })
    } catch (e: any) {
      setActionMessage({ text: e.message || "Error al actualizar rol", type: "error" })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado y Métricas Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control de perfiles, permisos, estado de cuenta y distintivos en misarroces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-card border border-border px-3 py-1.5 rounded-full text-xs font-semibold">
            Total: <strong>{totalCount}</strong>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            Activos: <strong>{activeCount}</strong>
          </div>
          {suspendedCount > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-xs font-semibold">
              Suspendidos: <strong>{suspendedCount}</strong>
            </div>
          )}
          <div className="bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            Pro: <strong>{professionalCount}</strong>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            Fundadores: <strong>{foundersCount}</strong>
          </div>
        </div>
      </div>

      {/* 2. Buscador y Filtros */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por @username, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/40 border border-border/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros desplegables */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="SUSPENDED">Suspendidos</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="PERSONAL">Personales</option>
              <option value="PROFESSIONAL">Profesionales (Todos)</option>
              <option value="CHEF">Pro · Chefs</option>
              <option value="RESTAURANT">Pro · Restaurantes</option>
              <option value="CREATOR">Pro · Creadores</option>
              <option value="BRAND">Pro · Marcas</option>
              <option value="PRODUCER">Pro · Productores</option>
              <option value="OTHER">Pro · Otros</option>
            </select>

            <select
              value={specialFilter}
              onChange={(e) => setSpecialFilter(e.target.value)}
              className="bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Sin filtro especial</option>
              <option value="ORGANIC">Solo usuarios orgánicos (20)</option>
              <option value="FOUNDER">Arroceros Fundadores</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Mostrando <strong>{filteredUsers.length}</strong> de <strong>{totalCount}</strong> usuarios</span>
          {(searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL" || specialFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
                setTypeFilter("ALL")
                setSpecialFilter("ALL")
              }}
              className="text-primary hover:underline font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* 3. Tabla / Listado de Usuarios */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                <th className="p-4">Usuario</th>
                <th className="p-4">Email</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Fundador</th>
                <th className="p-4">Actividad</th>
                <th className="p-4">Rol</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isFounder = u.founderNumber !== null
                  const isSuspended = u.accountStatus === "SUSPENDED"

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      {/* Usuario */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-border">
                            <ProfileAvatar avatarUrl={u.avatarUrl} username={u.displayName || u.username} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate flex items-center gap-1.5">
                              <span>{u.displayName || u.username}</span>
                              {u.username === "perellinares" && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-black">
                                  OFICIAL
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                        {u.email || <span className="text-muted-foreground/50">Sin email</span>}
                      </td>

                      {/* Estado */}
                      <td className="p-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Suspendido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="p-4 text-xs font-semibold">
                        {u.accountType === "PROFESSIONAL" ? (
                          <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            {u.professionalType || "PRO"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                            Personal
                          </span>
                        )}
                      </td>

                      {/* Fundador */}
                      <td className="p-4 text-xs">
                        {isFounder ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <Crown className="w-3 h-3" /> #{String(u.founderNumber).padStart(3, "0")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </td>

                      {/* Actividad */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span title={`${u.recipesCount} recetas`} className="flex items-center gap-0.5">
                            <UtensilsCrossed className="w-3 h-3 text-primary" /> {u.recipesCount}
                          </span>
                          <span title={`${u.postsCount} publicaciones`} className="flex items-center gap-0.5">
                            <ImageIcon className="w-3 h-3 text-amber-500" /> {u.postsCount}
                          </span>
                          <span title={`${u.sessionsCount} cocinados`} className="flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-orange-500" /> {u.sessionsCount}
                          </span>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="p-4 text-xs font-bold">
                        {u.adminRole ? (
                          <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                            {u.adminRole}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1 text-xs font-bold rounded-xl bg-card border border-border hover:bg-muted transition-colors inline-flex items-center gap-1"
                        >
                          <span>Ficha</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Ficha Administrativa de Usuario (Drawer / Modal) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera del modal */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0">
                  <ProfileAvatar avatarUrl={selectedUser.avatarUrl} username={selectedUser.displayName || selectedUser.username} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>{selectedUser.displayName || selectedUser.username}</span>
                    {selectedUser.founderNumber !== null && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> #{String(selectedUser.founderNumber).padStart(3, "0")}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>@{selectedUser.username}</span>
                    <span>·</span>
                    <Link
                      href={`/@${selectedUser.username}`}
                      target="_blank"
                      className="text-primary hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      <span>Ver perfil público</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUser(null)
                  setActionMessage(null)
                }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes de feedback */}
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

            {/* Contenido de la ficha */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Datos principales */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/40 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email oficial
                  </span>
                  <span className="font-mono font-semibold text-foreground break-all">
                    {selectedUser.email || "No disponible"}
                  </span>
                </div>

                <div className="bg-muted/40 p-3 rounded-2xl border border-border/50">
                  <span className="text-muted-foreground block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Fecha de alta
                  </span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Estadísticas de contenido */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Contenido generado
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <span className="text-xl font-black text-foreground block">{selectedUser.recipesCount}</span>
                    <span className="text-[11px] text-muted-foreground">Recetas</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <span className="text-xl font-black text-foreground block">{selectedUser.postsCount}</span>
                    <span className="text-[11px] text-muted-foreground">Publicaciones</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <span className="text-xl font-black text-foreground block">{selectedUser.sessionsCount}</span>
                    <span className="text-[11px] text-muted-foreground">Cocinados</span>
                  </div>
                </div>
              </div>

              {/* Acciones de gestión */}
              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Acciones Administrativas
                </p>

                {/* 1. Suspender / Reactivar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <div>
                    <span className="font-bold text-sm block">Estado de la cuenta</span>
                    <span className="text-xs text-muted-foreground">
                      Actualmente:{" "}
                      <strong>
                        {selectedUser.accountStatus === "SUSPENDED" ? "Suspendida" : "Activa"}
                      </strong>
                    </span>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleToggleStatus(selectedUser)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      selectedUser.accountStatus === "SUSPENDED"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-rose-600 hover:bg-rose-700 text-white"
                    }`}
                  >
                    {selectedUser.accountStatus === "SUSPENDED" ? "Reactivar cuenta" : "Suspender cuenta"}
                  </button>
                </div>

                {/* 2. Cambiar Tipo de Cuenta */}
                <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm block">Clasificación de Cuenta</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedUser.accountType === "PROFESSIONAL"
                          ? `Profesional (${selectedUser.professionalType || "CHEF"})`
                          : "Cuenta Personal"}
                      </span>
                    </div>

                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleToggleAccountType(
                          selectedUser,
                          selectedUser.accountType === "PROFESSIONAL" ? "PERSONAL" : "PROFESSIONAL",
                          selectedUser.professionalType || "CHEF"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border hover:bg-muted"
                    >
                      {selectedUser.accountType === "PROFESSIONAL"
                        ? "Cambiar a Personal"
                        : "Convertir en Profesional"}
                    </button>
                  </div>

                  {selectedUser.accountType === "PROFESSIONAL" && (
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground mr-1">Sector:</span>
                      {["CHEF", "RESTAURANT", "CREATOR", "BRAND", "PRODUCER", "OTHER"].map((sec) => (
                        <button
                          key={sec}
                          disabled={actionLoading}
                          onClick={() => handleToggleAccountType(selectedUser, "PROFESSIONAL", sec)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            selectedUser.professionalType === sec
                              ? "bg-primary text-white border-primary"
                              : "bg-card border-border hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Gestión de Roles Administrativos (SUPER_ADMIN ONLY) */}
                {currentAdminRole === "SUPER_ADMIN" && (
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm block flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Shield className="w-3.5 h-3.5" /> Rol Administrativo
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedUser.adminRole ? `Actualmente: ${selectedUser.adminRole}` : "Sin permisos administrativos"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAdminRoleChange(selectedUser, "NONE")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          !selectedUser.adminRole
                            ? "bg-card border-border text-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Quitar rol
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAdminRoleChange(selectedUser, "MODERATOR")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          selectedUser.adminRole === "MODERATOR"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Moderador
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAdminRoleChange(selectedUser, "ADMIN")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          selectedUser.adminRole === "ADMIN"
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAdminRoleChange(selectedUser, "SUPER_ADMIN")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          selectedUser.adminRole === "SUPER_ADMIN"
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Super Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => {
                  setSelectedUser(null)
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
