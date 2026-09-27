"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Gift, Clock, CheckCircle2, XCircle, Trophy, ShieldCheck, Share2, Users, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { Giveaway } from "@/types/giveaway"
import { getUserGiveawayStatus } from "@/app/actions/giveaways"
import { GiveawayManagementModal } from "@/components/domain/GiveawayManagementModal"

interface GiveawayBannerProps {
  giveaway: Giveaway
  currentUserId?: string | null
  compact?: boolean // For feed cards
}

export function GiveawayBanner({ giveaway, currentUserId, compact = false }: GiveawayBannerProps) {
  const [userStatus, setUserStatus] = useState<any>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [showDetails, setShowDetails] = useState(!compact)
  const [showManageModal, setShowManageModal] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  const isOrganizer = currentUserId && currentUserId === giveaway.organizer_id
  const isFinished = giveaway.status === "DRAWN" || giveaway.status === "CLOSED"
  const isCancelled = giveaway.status === "CANCELLED"
  const isActive = giveaway.status === "ACTIVE"

  // Cargar estado de participación del usuario si está autenticado
  useEffect(() => {
    if (!currentUserId || !giveaway.post_id) return
    let isMounted = true

    async function loadStatus() {
      setLoadingStatus(true)
      try {
        const res = await getUserGiveawayStatus(giveaway.post_id!)
        if (isMounted) setUserStatus(res)
      } catch (err) {
        console.error("Error loading user giveaway status:", err)
      } finally {
        if (isMounted) setLoadingStatus(false)
      }
    }

    loadStatus()
    return () => {
      isMounted = false
    }
  }, [currentUserId, giveaway.post_id, giveaway.status])

  // Formato de tiempo restante limpio
  const getRemainingTimeText = () => {
    if (isCancelled) return "Sorteo cancelado"
    if (isFinished) return "Sorteo finalizado"

    const now = new Date()
    const end = new Date(giveaway.ends_at)
    const diffMs = end.getTime() - now.getTime()

    if (diffMs <= 0) return "Cerrando sorteo..."

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays >= 2) {
      return `Quedan ${diffDays} días · Cierra el ${end.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
    }
    if (diffDays === 1) {
      return `Queda 1 día · Cierra mañana a las ${end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
    }
    if (diffHours >= 1) {
      return `Quedan ${diffHours} h · Cierra hoy a las ${end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `¡Últimos ${diffMinutes} minutos!`
  }

  // Compartir resultado
  const handleShare = async () => {
    const certUrl = `https://www.misarroces.es/sorteos/${giveaway.certificate_code}`
    const text = isFinished
      ? `🎉 ¡Sorteo finalizado en misarroces! Comprueba los ganadores certificados de "${giveaway.title}".`
      : `🎁 ¡Participa en el sorteo de "${giveaway.title}" en misarroces!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: giveaway.title,
          text,
          url: certUrl
        })
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(certUrl)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2500)
    } catch {}
  }

  const winners = (giveaway.results || []).filter((r) => r.role === "WINNER")

  // Vista compacta para el Feed
  if (compact) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 sm:p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm shrink-0">
              SORTEO
            </span>
            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
              {giveaway.title}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                : isCancelled
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {isActive ? "Activo" : isCancelled ? "Cancelado" : "Finalizado"}
          </span>
        </div>

        <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate font-medium">{giveaway.prize}</span>
          </div>
          <span className="text-[11px] text-muted-foreground/80 shrink-0">
            {getRemainingTimeText()}
          </span>
        </div>

        {isFinished && winners.length > 0 && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Ganador:</span>
              <span className="text-primary font-bold">
                @{winners[0].user?.username || "ganador"}
              </span>
              {winners.length > 1 && (
                <span className="text-muted-foreground text-[11px]">
                  +{winners.length - 1} más
                </span>
              )}
            </div>
            <Link
              href={`/sorteos/${giveaway.certificate_code}`}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              Certificado
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Vista completa en detalle de publicación
  return (
    <>
      <div className="rounded-2xl border border-amber-500/35 bg-card p-4 sm:p-5 shadow-sm space-y-4">
        {/* Cabecera del Sorteo */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  SORTEO OFICIAL
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                      : isCancelled
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isActive ? "Activo" : isCancelled ? "Cancelado" : "Finalizado"}
                </span>
              </div>
              <h2 className="font-bold text-base sm:text-lg text-foreground mt-1">
                {giveaway.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOrganizer && (
              <button
                type="button"
                onClick={() => setShowManageModal(true)}
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors"
              >
                Gestionar
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground transition-colors"
              title="Compartir sorteo"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Caja de Premio */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0 space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Premio
            </span>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {giveaway.prize}
            </p>
            {giveaway.description && (
              <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                {giveaway.description}
              </p>
            )}
          </div>
        </div>

        {/* Plazo y Cierre */}
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 px-3.5 py-2.5 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>{getRemainingTimeText()}</span>
          </div>
          <div className="font-medium text-foreground">
            {giveaway.num_winners} {giveaway.num_winners === 1 ? "ganador" : "ganadores"}
            {giveaway.num_alternates > 0 && ` · ${giveaway.num_alternates} suplentes`}
          </div>
        </div>

        {/* GANADORES SI ESTÁ FINALIZADO */}
        {isFinished && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-sm text-foreground">
                  Ganadores Certificados
                </span>
              </div>
              <Link
                href={`/sorteos/${giveaway.certificate_code}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Ver Certificado
              </Link>
            </div>

            {winners.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {winners.map((w) => (
                  <Link
                    key={w.id}
                    href={`/@${w.user?.username}`}
                    className="p-2.5 rounded-xl bg-card border border-border flex items-center gap-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                      {w.user?.avatar?.storage_path ? (
                        <img
                          src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${w.user.avatar.storage_path}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                          {w.user?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-extrabold text-foreground truncate">
                          {w.user?.display_name || `@${w.user?.username}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        @{w.user?.username} · Ganador #{w.position}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No hubo participantes elegibles que cumplieran todas las condiciones.
              </p>
            )}
          </div>
        )}

        {/* ESTADO DE PARTICIPACIÓN DEL USUARIO ACTUAL */}
        {currentUserId && !isOrganizer && (
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tu participación
              </span>
              {loadingStatus ? (
                <span className="text-[11px] text-muted-foreground animate-pulse">Comprobando...</span>
              ) : userStatus?.isEligible ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cumples todas las condiciones
                </span>
              ) : userStatus?.isParticipating ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Participación incompleta
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Aún no participas
                </span>
              )}
            </div>

            {/* Checklist de condiciones */}
            <div className="grid gap-1.5 text-xs pt-1">
              {giveaway.require_follow && (
                <div className="flex items-center gap-2">
                  {userStatus?.checks?.follow ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <span className={userStatus?.checks?.follow ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Seguir a @{giveaway.organizer?.username || "organizador"}
                  </span>
                </div>
              )}

              {giveaway.require_like && (
                <div className="flex items-center gap-2">
                  {userStatus?.checks?.like ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <span className={userStatus?.checks?.like ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Dar Me gusta a esta publicación
                  </span>
                </div>
              )}

              {giveaway.require_comment && (
                <div className="flex items-center gap-2">
                  {userStatus?.checks?.comment ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <span className={userStatus?.checks?.comment ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Dejar un comentario
                  </span>
                </div>
              )}

              {giveaway.min_mentions > 0 && (
                <div className="flex items-center gap-2">
                  {userStatus?.checks?.mentions ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <span className={userStatus?.checks?.mentions ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Mencionar a {giveaway.min_mentions} persona{giveaway.min_mentions > 1 ? "s" : ""} en un comentario
                  </span>
                </div>
              )}

              {giveaway.required_keyword && (
                <div className="flex items-center gap-2">
                  {userStatus?.checks?.keyword ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <span className={userStatus?.checks?.keyword ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Incluir "{giveaway.required_keyword}" en el comentario
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bases Legales desplegables */}
        <div className="border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Bases legales y certificado oficial</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-muted/20 border border-border/50 text-[11px] text-muted-foreground space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span>Código de Certificado:</span>
                <Link
                  href={`/sorteos/${giveaway.certificate_code}`}
                  className="font-mono font-bold text-primary hover:underline"
                >
                  {giveaway.certificate_code}
                </Link>
              </div>
              <p className="whitespace-pre-line leading-relaxed font-sans max-h-40 overflow-y-auto pr-1">
                {giveaway.terms_and_conditions}
              </p>
            </div>
          )}
        </div>

        {copiedShare && (
          <div className="text-center text-xs font-bold text-primary animate-in fade-in">
            ✓ Enlace del certificado copiado al portapapeles
          </div>
        )}
      </div>

      {/* Modal de gestión para el organizador */}
      {showManageModal && (
        <GiveawayManagementModal
          giveawayId={giveaway.id}
          certificateCode={giveaway.certificate_code}
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </>
  )
}
