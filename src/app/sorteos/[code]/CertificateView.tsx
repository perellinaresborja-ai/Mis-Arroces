"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ShieldCheck, 
  Trophy, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  Hash, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Giveaway } from "@/types/giveaway"

interface CertificateViewProps {
  giveaway: Giveaway
}

export function CertificateView({ giveaway }: CertificateViewProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const isDrawn = giveaway.status === "DRAWN"
  const isClosed = giveaway.status === "CLOSED"
  const isActive = giveaway.status === "ACTIVE"
  const isCancelled = giveaway.status === "CANCELLED"

  const winners = (giveaway.results || []).filter(r => r.role === "WINNER")
  const alternates = (giveaway.results || []).filter(r => r.role === "ALTERNATE")

  const copyToClipboard = async (text: string, type: "code" | "hash" | "share") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "code") {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else if (type === "hash") {
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2000)
      } else if (type === "share") {
        setCopiedShare(true)
        setTimeout(() => setCopiedShare(false), 2000)
      }
    } catch {}
  }

  const handleShare = async () => {
    const certUrl = typeof window !== "undefined" ? window.location.href : `https://www.misarroces.es/sorteos/${giveaway.certificate_code}`
    const text = isDrawn
      ? `🎉 Comprueba el certificado oficial del sorteo "${giveaway.title}" en misarroces.`
      : `🎁 Comprueba las bases y el certificado del sorteo "${giveaway.title}" en misarroces.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado ${giveaway.certificate_code} | misarroces`,
          text,
          url: certUrl,
        })
        return
      } catch {}
    }

    copyToClipboard(certUrl, "share")
  }

  const organizerAvatar = giveaway.organizer?.avatar?.storage_path
    ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${giveaway.organizer.avatar.storage_path}`
    : null

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex h-14 items-center justify-between px-4 max-w-3xl mx-auto">
          <Link
            href={giveaway.post_id ? `/posts/${giveaway.post_id}` : "/"}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{giveaway.post_id ? "Volver a la publicación" : "Inicio"}</span>
          </Link>

          <Link href="/" className="font-extrabold text-base tracking-tight text-foreground">
            mis<span className="text-primary">arroces</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/80 hover:bg-muted text-xs font-bold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? "¡Copiado!" : "Compartir"}</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Certificate Seal Hero */}
        <section className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Stamp */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold text-xs tracking-wider uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Certificado Oficial de Sorteo</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {giveaway.title}
          </h1>

          {/* Unique Certificate Code */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/70 border border-border">
            <span className="text-xs uppercase font-bold text-muted-foreground">ID Certificado:</span>
            <span className="font-mono font-bold text-sm sm:text-base text-foreground">
              {giveaway.certificate_code}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(giveaway.certificate_code, "code")}
              className="p-1 hover:text-primary transition-colors text-muted-foreground"
              title="Copiar código del certificado"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isDrawn
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  : isClosed
                  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  : isActive
                  ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                  : "bg-destructive/10 text-destructive border-destructive/25"
              }`}
            >
              {isDrawn
                ? "Sorteo Finalizado y Certificado"
                : isClosed
                ? "Sorteo Cerrado (Pendiente de sorteo)"
                : isActive
                ? "Sorteo Activo en Curso"
                : "Sorteo Cancelado"}
            </span>
          </div>
        </section>

        {/* Prize & Organizer Card */}
        <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-5">
          {/* Prize Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Premio Certificado
              </span>
              <p className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                {giveaway.prize}
              </p>
              {giveaway.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {giveaway.description}
                </p>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
            <div className="flex items-center gap-3">
              <Link href={`/@${giveaway.organizer?.username}`}>
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                  {organizerAvatar ? (
                    <img
                      src={organizerAvatar}
                      alt={giveaway.organizer?.username || "organizador"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                      {giveaway.organizer?.username?.[0]?.toUpperCase() || "O"}
                    </div>
                  )}
                </div>
              </Link>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Organizado por
                </span>
                <Link
                  href={`/@${giveaway.organizer?.username}`}
                  className="font-bold text-sm sm:text-base text-foreground hover:underline block truncate"
                >
                  {giveaway.organizer?.display_name || giveaway.organizer?.username}
                </Link>
                <span className="text-xs text-muted-foreground">
                  @{giveaway.organizer?.username}
                </span>
              </div>
            </div>

            {giveaway.post_id && (
              <Link
                href={`/posts/${giveaway.post_id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-muted/80 hover:bg-muted text-xs font-bold text-foreground transition-colors border border-border"
              >
                <span>Ver publicación oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </section>

        {/* WINNERS SECTION (If Drawn) */}
        {isDrawn && winners.length > 0 && (
          <section className="bg-card rounded-2xl sm:rounded-3xl border border-emerald-500/30 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-black text-foreground">
                  Ganadores Certificados
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                {winners.filter(w => w.status === "CONFIRMED").length} de {winners.length} confirmados
              </span>
            </div>

            <div className="space-y-3">
              {winners.map(winner => {
                const isReplaced = winner.status === "REPLACED"
                const avatar = winner.user?.avatar?.storage_path
                  ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${winner.user.avatar.storage_path}`
                  : null

                return (
                  <div
                    key={winner.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isReplaced
                        ? "bg-muted/20 border-border/60 opacity-80"
                        : "bg-emerald-500/5 border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {winner.position}º
                        </span>

                        <Link href={`/@${winner.user?.username}`}>
                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={winner.user?.username || "ganador"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground text-xs">
                                {winner.user?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={`/@${winner.user?.username}`}
                            className="font-bold text-sm text-foreground hover:underline truncate block"
                          >
                            {winner.user?.display_name || winner.user?.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            @{winner.user?.username}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          isReplaced
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                        }`}
                      >
                        {isReplaced ? "Sustituido por suplente" : "Ganador Oficial"}
                      </span>
                    </div>

                    {/* Substitution Audit Box */}
                    {isReplaced && (
                      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-destructive">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Motivo de sustitución documentado:</span>
                        </div>
                        <p className="italic bg-background/50 p-2 rounded-xl border border-border/50 text-foreground">
                          "{winner.replacement_reason || "No especificado"}"
                        </p>
                        {winner.replaced_by_user && (
                          <p className="text-[11px] pt-1">
                            Sustituido por el suplente:{" "}
                            <Link
                              href={`/@${winner.replaced_by_user.username}`}
                              className="font-bold text-primary hover:underline"
                            >
                              @{winner.replaced_by_user.username}
                            </Link>{" "}
                            el{" "}
                            {winner.replaced_at
                              ? new Date(winner.replaced_at).toLocaleString("es-ES")
                              : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ALTERNATES SECTION */}
        {isDrawn && alternates.length > 0 && (
          <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Suplentes Oficiales
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {alternates.length} {alternates.length === 1 ? "suplente extraído" : "suplentes extraídos"}
              </span>
            </div>

            <div className="space-y-2.5">
              {alternates.map(alt => {
                const avatar = alt.user?.avatar?.storage_path
                  ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${alt.user.avatar.storage_path}`
                  : null
                const isPromoted = alt.status === "CLAIMED"

                return (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0">
                        S{alt.position}
                      </span>
                      <Link href={`/@${alt.user?.username}`}>
                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={alt.user?.username || "suplente"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {alt.user?.username?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/@${alt.user?.username}`}
                          className="font-bold text-xs sm:text-sm text-foreground hover:underline truncate block"
                        >
                          {alt.user?.display_name || alt.user?.username}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          @{alt.user?.username}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPromoted
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isPromoted ? "Promovido a Ganador" : "En Reserva"}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* VERIFIED REQUIREMENTS */}
        <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Condiciones Verificadas por misarroces</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  giveaway.require_follow ? "text-emerald-500" : "text-muted-foreground/50"
                }`}
              />
              <div>
                <span className="font-semibold block text-foreground">Seguir a la cuenta</span>
                <span className="text-muted-foreground">
                  {giveaway.require_follow
                    ? `Obligatorio seguir a @${giveaway.organizer?.username}`
                    : "No requerido"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  giveaway.require_like ? "text-emerald-500" : "text-muted-foreground/50"
                }`}
              />
              <div>
                <span className="font-semibold block text-foreground">Me gusta en la publicación</span>
                <span className="text-muted-foreground">
                  {giveaway.require_like ? "Obligatorio dar me gusta" : "No requerido"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  giveaway.require_comment ? "text-emerald-500" : "text-muted-foreground/50"
                }`}
              />
              <div>
                <span className="font-semibold block text-foreground">Comentario en la publicación</span>
                <span className="text-muted-foreground">
                  {giveaway.require_comment ? "Obligatorio dejar un comentario" : "No requerido"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  giveaway.min_mentions > 0 ? "text-emerald-500" : "text-muted-foreground/50"
                }`}
              />
              <div>
                <span className="font-semibold block text-foreground">Menciones a amigos</span>
                <span className="text-muted-foreground">
                  {giveaway.min_mentions > 0
                    ? `Mínimo ${giveaway.min_mentions} amigo${giveaway.min_mentions > 1 ? "s" : ""} (@...)`
                    : "No requerido"}
                </span>
              </div>
            </div>

            {giveaway.required_keyword && (
              <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-2.5 sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold block text-foreground">Palabra clave / Hashtag</span>
                  <span className="text-muted-foreground">
                    El comentario debía incluir obligatoriamente:{" "}
                    <code className="bg-background px-1.5 py-0.5 rounded text-primary font-bold">
                      {giveaway.required_keyword}
                    </code>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
            <strong>Regla de equidad:</strong> Cada cuenta dispone de exactamente 1 participación válida. Los comentarios adicionales no multiplican las probabilidades de ganar para garantizar la máxima transparencia e igualdad entre participantes.
          </div>
        </section>

        {/* TECHNICAL & INTEGRITY DETAILS */}
        <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Hash className="w-5 h-5 text-amber-500" />
            <span>Transparencia Técnica y Criptografía</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Evaluados
              </span>
              <span className="text-lg font-black text-foreground">
                {giveaway.total_evaluated_count || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Aptos (Válidos)
              </span>
              <span className="text-lg font-black text-emerald-600">
                {giveaway.total_eligible_count || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Ganadores
              </span>
              <span className="text-lg font-black text-foreground">
                {giveaway.num_winners}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Suplentes
              </span>
              <span className="text-lg font-black text-foreground">
                {giveaway.num_alternates}
              </span>
            </div>
          </div>

          {/* Dates list */}
          <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/20 p-3.5 rounded-2xl border border-border/60">
            <div className="flex justify-between">
              <span>Publicado:</span>
              <strong className="text-foreground">{new Date(giveaway.starts_at).toLocaleString("es-ES")}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cierre de participaciones:</span>
              <strong className="text-foreground">{new Date(giveaway.ends_at).toLocaleString("es-ES")}</strong>
            </div>
            {giveaway.drawn_at && (
              <div className="flex justify-between">
                <span>Extracción de ganadores:</span>
                <strong className="text-foreground">{new Date(giveaway.drawn_at).toLocaleString("es-ES")}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Algoritmo de sorteo:</span>
              <strong className="text-foreground">CSPRNG Server-Side (crypto.randomInt)</strong>
            </div>
          </div>

          {/* SHA-256 Hash Box */}
          {giveaway.selection_hash && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Huella de Integridad (SHA-256):</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(giveaway.selection_hash!, "hash")}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? "Copiado" : "Copiar Hash"}</span>
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-muted/70 border border-border font-mono text-[11px] sm:text-xs text-foreground/90 break-all select-all">
                {giveaway.selection_hash}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Esta huella SHA-256 sella criptográficamente el censo de participantes aptos al momento del cierre. Cualquier alteración posterior invalidaría este hash.
              </p>
            </div>
          )}
        </section>

        {/* AUDIT TRAIL / HISTORIAL */}
        {giveaway.audit_logs && giveaway.audit_logs.length > 0 && (
          <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>Registro de Auditoría y Trazabilidad</span>
            </h2>

            <div className="relative pl-6 border-l-2 border-border/80 space-y-4 my-2 text-xs">
              {giveaway.audit_logs.map(log => {
                const dateStr = new Date(log.created_at).toLocaleString("es-ES")
                const actorName = log.actor?.display_name || log.actor?.username || "Sistema"

                let actionTitle = log.action
                if (log.action === "CREATE") actionTitle = "Sorteo creado oficialmente"
                if (log.action === "CLOSE") actionTitle = "Cierre de participaciones y censo congelado"
                if (log.action === "DRAW") actionTitle = "Extracción de ganadores con algoritmo criptográfico"
                if (log.action === "WINNER_REPLACE") actionTitle = "Sustitución de ganador por suplente"
                if (log.action === "CANCEL") actionTitle = "Sorteo cancelado"

                return (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-foreground font-semibold">{actionTitle}</strong>
                        <span className="text-[11px] text-muted-foreground">{dateStr}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Por: @{log.actor?.username || "sistema"}
                        {log.details?.reason && (
                          <div className="mt-1 italic text-foreground bg-muted/30 p-2 rounded-xl border border-border/50">
                            Motivo: "{log.details.reason}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* LEGAL TERMS ACCORDION */}
        <section className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between gap-2 text-left font-bold text-sm sm:text-base text-foreground"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Bases Legales Oficiales y Descargo de Responsabilidad</span>
            </div>
            {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTerms && (
            <div className="mt-4 pt-4 border-t border-border/60 space-y-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
              <div className="whitespace-pre-wrap font-sans bg-muted/20 p-4 rounded-2xl border border-border/60 text-foreground">
                {giveaway.terms_and_conditions}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-200">
                <strong>Descargo de responsabilidad de la plataforma:</strong> misarroces es una plataforma de software independiente que facilita la verificación objetiva de requisitos en sorteos comunitarios. misarroces no patrocina, avala ni administra este sorteo. La entrega del premio, cumplimiento de bases y obligaciones legales corresponden exclusiva e íntegramente al organizador @{giveaway.organizer?.username}.
              </div>
            </div>
          )}
        </section>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? "¡Enlace Copiado!" : "Compartir Certificado"}</span>
          </button>

          {giveaway.post_id && (
            <Link
              href={`/posts/${giveaway.post_id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-colors text-center border border-border"
            >
              Ver Publicación del Sorteo
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
