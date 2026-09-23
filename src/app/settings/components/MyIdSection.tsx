"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  QrCode, 
  Shield, 
  Share2, 
  Check, 
  ExternalLink, 
  Activity, 
  Calendar, 
  UtensilsCrossed, 
  MapPin, 
  Trophy, 
  Gift, 
  Award, 
  Sparkles,
  UserPlus
} from "lucide-react"

export interface UserActivityItem {
  id: string
  user_id: string
  activity_type: string
  title: string
  description: string | null
  occurred_at: string
  metadata?: Record<string, any>
  status?: string
}

interface MyIdSectionProps {
  isFounder: boolean
  founderNumber: number | null
  publicCode: string | null
  activities: UserActivityItem[]
}

function getActivityIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "EVENT":
      return <Calendar className="w-4 h-4 text-sky-500" />
    case "TASTING":
      return <UtensilsCrossed className="w-4 h-4 text-amber-500" />
    case "CHECKIN":
      return <MapPin className="w-4 h-4 text-emerald-500" />
    case "CONTEST":
      return <Trophy className="w-4 h-4 text-yellow-500" />
    case "RAFFLE":
      return <Gift className="w-4 h-4 text-purple-500" />
    case "AWARD":
      return <Award className="w-4 h-4 text-orange-500" />
    default:
      return <Sparkles className="w-4 h-4 text-primary" />
  }
}

export function MyIdSection({
  isFounder,
  founderNumber,
  publicCode,
  activities = [],
}: MyIdSectionProps) {
  const [copied, setCopied] = useState(false)

  const formattedFounderNumber = founderNumber !== null ? String(founderNumber).padStart(3, "0") : null
  const baseUrl = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es")

  const referralUrl = publicCode ? `${baseUrl}/fundadores/r/${publicCode}` : `${baseUrl}/fundadores`

  const handleShareInvite = async () => {
    const text = `Te recomiendo para formar parte de Los 100 Arroceros Fundadores de misarroces.\n\nSolo existirán 100. Cuando se completen, se cerrará para siempre.`

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Los 100 Arroceros Fundadores",
          text,
          url: referralUrl,
        })
        return
      } catch (err: any) {
        if (err?.name === "AbortError") return
      }
    }

    // Fallback portapapeles si no hay navigator.share disponible
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${referralUrl}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch (err) {
        console.error("Error al copiar enlace", err)
      }
    }
  }

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      {/* CABECERA: ID Y ACCESO A VER MI ID */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground text-base">Mi ID</span>
              {isFounder && formattedFounderNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FAF8F5] text-[#EA580C] border border-[#EA580C]/30 shadow-2xs">
                  <Shield className="w-3 h-3 text-[#EA580C]" />
                  Fundador #{formattedFounderNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              ID personal e intransferible
            </p>
          </div>
        </div>

        {publicCode && (
          <Link
            href={`/id/${publicCode}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Ver mi ID</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* OPCIÓN PARA COMPARTIR INVITACIÓN DE FUNDADOR (SOLO FUNDADORES) */}
      {isFounder && publicCode && (
        <>
          <div className="h-px bg-border"></div>
          <div className="p-4 sm:p-5 bg-muted/20 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#EA580C]" />
                  <span className="font-bold text-sm text-foreground">Recomendar Fundador</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Recomienda a alguien para formar parte de Los 100 Arroceros Fundadores con tu enlace personal.
                </p>
              </div>

              <button
                type="button"
                onClick={handleShareInvite}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Invitar a un arrocero</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              La invitación no reserva plaza, no altera el orden de asignación y no garantiza ser Fundador.
            </p>
          </div>
        </>
      )}

      {/* APARTADO: MI ACTIVIDAD */}
      <div className="h-px bg-border"></div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-bold text-sm text-foreground">Mi actividad</h4>
          </div>
          <span className="text-[11px] text-muted-foreground">Historial personal</span>
        </div>

        {activities.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-muted/30 border border-dashed border-border/70">
            <p className="text-sm font-medium text-muted-foreground">
              Todavía no tienes actividad registrada.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Aquí aparecerán tus eventos, catas, check-ins, concursos, sorteos y reconocimientos oficiales.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((act) => (
              <div 
                key={act.id} 
                className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5">
                  {getActivityIcon(act.activity_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-sm truncate">{act.title}</h5>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(act.occurred_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
