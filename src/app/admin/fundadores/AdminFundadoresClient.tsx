"use client"

import { useState } from "react"
import {
  Crown,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Send,
  User,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { resendFounderWelcomeEmailAdmin } from "@/app/actions/admin"

export interface FounderListItem {
  founderNumber: number
  userId: string
  grantedAt: string
  welcomeEmailSentAt: string | null
  user: {
    username: string
    displayName: string | null
    email: string | null
    accountStatus: string
    avatarUrl: string | null
  } | null
}

interface AdminFundadoresClientProps {
  founders: FounderListItem[]
  totalSpots?: number
}

export function AdminFundadoresClient({
  founders,
  totalSpots = 100,
}: AdminFundadoresClientProps) {
  const [resendingNumber, setResendingNumber] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ number: number; text: string; success: boolean } | null>(null)

  const assignedCount = founders.length
  const availableCount = Math.max(0, totalSpots - assignedCount)
  const nextNumber = founders.length > 0 ? Math.max(...founders.map((f) => f.founderNumber)) + 1 : 0
  const pendingEmailsCount = founders.filter((f) => !f.welcomeEmailSentAt).length
  const percentComplete = Math.min(100, Math.round((assignedCount / totalSpots) * 100))

  const handleResendWelcome = async (founder: FounderListItem) => {
    if (!confirm(`¿Reenviar el email oficial de bienvenida al Arrocero Fundador #${String(founder.founderNumber).padStart(3, "0")} (${founder.user?.email || "usuario"})?`)) {
      return
    }

    setResendingNumber(founder.founderNumber)
    setFeedback(null)
    try {
      await resendFounderWelcomeEmailAdmin(founder.founderNumber)
      founder.welcomeEmailSentAt = new Date().toISOString()
      setFeedback({
        number: founder.founderNumber,
        text: `Email oficial reenviado con éxito a ${founder.user?.email || "destinatario"}`,
        success: true,
      })
    } catch (e: any) {
      setFeedback({
        number: founder.founderNumber,
        text: e.message || "Error al enviar el email",
        success: false,
      })
    } finally {
      setResendingNumber(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-600 border border-amber-600/20 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Arroceros Fundadores</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control de las {totalSpots} plazas fundadoras exclusivas de misarroces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            Cupo Máximo {totalSpots}
          </span>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen Numérico Oficial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Plazas Asignadas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{assignedCount}</span>
            <span className="text-xs text-muted-foreground font-semibold">/ {totalSpots}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Plazas Disponibles
          </span>
          <span className="text-3xl font-black text-emerald-600 block">{availableCount}</span>
          <p className="text-[11px] text-muted-foreground">
            Se asignan automáticamente por orden de primera receta.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Siguiente Número
          </span>
          <span className="text-3xl font-black text-primary block">
            #{String(nextNumber).padStart(3, "0")}
          </span>
          <p className="text-[11px] text-muted-foreground">Próxima vacante a conceder</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Emails de Bienvenida
          </span>
          {pendingEmailsCount > 0 ? (
            <div>
              <span className="text-3xl font-black text-amber-600 block">{pendingEmailsCount}</span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Pendientes de envío
              </p>
            </div>
          ) : (
            <div>
              <span className="text-3xl font-black text-emerald-600 block">100%</span>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                Todas las bienvenidas al día
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback general de reenvío */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedback.success
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          }`}
        >
          {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 3. Tabla de Fundadores Asignados */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                <th className="p-4 w-20 text-center">Plaza</th>
                <th className="p-4">Arrocero Fundador</th>
                <th className="p-4">Email</th>
                <th className="p-4">Fecha Asignación</th>
                <th className="p-4">Email Bienvenida</th>
                <th className="p-4">Estado Cuenta</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {founders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Aún no hay fundadores asignados.
                  </td>
                </tr>
              ) : (
                founders.map((f) => {
                  const isSent = Boolean(f.welcomeEmailSentAt)

                  return (
                    <tr key={f.founderNumber} className="hover:bg-muted/30 transition-colors">
                      {/* Plaza con formato #000 */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs">
                          <Crown className="w-3 h-3" />
                          #{String(f.founderNumber).padStart(3, "0")}
                        </span>
                      </td>

                      {/* Usuario */}
                      <td className="p-4">
                        {f.user ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
                              <ProfileAvatar avatarUrl={f.user.avatarUrl} username={f.user.displayName || f.user.username} />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/@${f.user.username}`}
                                target="_blank"
                                className="font-bold text-foreground text-sm hover:text-primary transition truncate block"
                              >
                                {f.user.displayName || `@${f.user.username}`}
                              </Link>
                              <span className="text-xs text-muted-foreground">@{f.user.username}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Usuario no encontrado</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-4 text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                        {f.user?.email || "Sin email"}
                      </td>

                      {/* Fecha de asignación */}
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(f.grantedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Estado email bienvenida */}
                      <td className="p-4 text-xs">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {new Date(f.welcomeEmailSentAt!).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </td>

                      {/* Estado cuenta */}
                      <td className="p-4 text-xs font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            f.user?.accountStatus === "ACTIVE"
                              ? "text-emerald-600 bg-emerald-500/10"
                              : "text-rose-600 bg-rose-500/10"
                          }`}
                        >
                          {f.user?.accountStatus || "ACTIVE"}
                        </span>
                      </td>

                      {/* Acción Reenviar Bienvenida */}
                      <td className="p-4 text-right">
                        <button
                          disabled={resendingNumber === f.founderNumber}
                          onClick={() => handleResendWelcome(f)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border hover:bg-primary hover:text-white transition shadow-sm inline-flex items-center gap-1.5"
                          title="Enviar email oficial de bienvenida con Resend"
                        >
                          <Send className="w-3 h-3" />
                          <span>{resendingNumber === f.founderNumber ? "Enviando..." : "Reenviar"}</span>
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
    </div>
  )
}
