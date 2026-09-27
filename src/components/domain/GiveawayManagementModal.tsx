"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Users,
  ShieldCheck,
  RotateCcw,
  Ban,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react"
import {
  getGiveawayParticipantsServer,
  drawGiveawayWinners,
  replaceWinnerWithAlternate,
  cancelGiveaway
} from "@/app/actions/giveaways"
import { GiveawayParticipant, Giveaway } from "@/types/giveaway"

interface GiveawayManagementModalProps {
  giveawayId: string
  certificateCode: string
  isOpen: boolean
  onClose: () => void
}

export function GiveawayManagementModal({
  giveawayId,
  certificateCode,
  isOpen,
  onClose
}: GiveawayManagementModalProps) {
  const [tab, setTab] = useState<"participants" | "draw" | "results">("participants")
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [participants, setParticipants] = useState<GiveawayParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "eligible" | "ineligible">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Sorteo y animación 3-2-1
  const [isDrawing, setIsDrawing] = useState(false)
  const [showConfirmDraw, setShowConfirmDraw] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [drawnResults, setDrawnResults] = useState<any | null>(null)
  const [revealedWinnersCount, setRevealedWinnersCount] = useState<number>(0)

  // Cancelación
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // Sustitución
  const [replacingWinnerId, setReplacingWinnerId] = useState<string | null>(null)
  const [replacementReason, setReplacementReason] = useState("")
  const [isReplacing, setIsReplacing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Cargar datos
  const loadData = async () => {
    setLoading(true)
    setActionError(null)
    try {
      const res = await getGiveawayParticipantsServer(giveawayId)
      setGiveaway(res.giveaway)
      setParticipants(res.participants)
      if (res.giveaway.status === "DRAWN") {
        setTab("results")
      }
    } catch (err: any) {
      setActionError(err.message || "Error al cargar datos del sorteo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, giveawayId])

  if (!isOpen) return null

  // Filtrado de participantes
  const filteredParticipants = participants.filter((p) => {
    if (filter === "eligible" && !p.isEligible) return false
    if (filter === "ineligible" && p.isEligible) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.username.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q)
      )
    }
    return true
  })

  const eligibleCount = participants.filter((p) => p.isEligible).length
  const ineligibleCount = participants.length - eligibleCount

  // Ejecutar el sorteo criptográfico con animación
  const handleStartDraw = async () => {
    setShowConfirmDraw(false)
    setIsDrawing(true)
    setActionError(null)

    try {
      // 1. Ejecutar en servidor (persistencia atómica previa)
      const res = await drawGiveawayWinners(giveawayId)
      setDrawnResults(res)

      // 2. Animación visual 3... 2... 1...
      setCountdown(3)
      await new Promise((r) => setTimeout(r, 900))
      setCountdown(2)
      await new Promise((r) => setTimeout(r, 900))
      setCountdown(1)
      await new Promise((r) => setTimeout(r, 900))
      setCountdown(0)
      await new Promise((r) => setTimeout(r, 600))
      setCountdown(null)

      // 3. Revelación secuencial de ganadores
      const totalWinners = res.winners.length
      for (let i = 1; i <= totalWinners; i++) {
        setRevealedWinnersCount(i)
        await new Promise((r) => setTimeout(r, 650))
      }

      await loadData()
      setTab("results")
    } catch (err: any) {
      setActionError(err.message || "Error al realizar el sorteo")
    } finally {
      setIsDrawing(false)
    }
  }

  // Sustituir ganador por suplente
  const handleReplaceWinner = async () => {
    if (!replacingWinnerId) return
    setIsReplacing(true)
    setActionError(null)

    try {
      await replaceWinnerWithAlternate(giveawayId, replacingWinnerId, replacementReason)
      setReplacingWinnerId(null)
      setReplacementReason("")
      await loadData()
    } catch (err: any) {
      setActionError(err.message || "Error al sustituir ganador")
    } finally {
      setIsReplacing(false)
    }
  }

  // Cancelar sorteo
  const handleCancelGiveaway = async () => {
    setIsCancelling(true)
    setActionError(null)

    try {
      await cancelGiveaway(giveawayId, cancelReason)
      setShowCancelPrompt(false)
      await loadData()
    } catch (err: any) {
      setActionError(err.message || "Error al cancelar sorteo")
    } finally {
      setIsCancelling(false)
    }
  }

  const winners = (giveaway?.results || []).filter((r) => r.role === "WINNER")
  const alternates = (giveaway?.results || []).filter((r) => r.role === "ALTERNATE")

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  Gestión del sorteo
                </h3>
                <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-semibold">
                  {certificateCode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
                {giveaway?.title || "Cargando..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="flex border-b border-border px-5 gap-4 shrink-0 text-sm font-semibold bg-muted/20">
          <button
            type="button"
            onClick={() => setTab("participants")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "participants"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participantes ({participants.length})</span>
          </button>

          {giveaway?.status === "DRAWN" ? (
            <button
              type="button"
              onClick={() => setTab("results")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === "results"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Resultados Certificados</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTab("draw")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === "draw"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Realizar sorteo</span>
            </button>
          )}
        </div>

        {/* Mensaje de error si ocurre */}
        {actionError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
            {actionError}
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Evaluando participantes en tiempo real...</span>
            </div>
          ) : isDrawing ? (
            /* ANIMACIÓN DE CUENTA ATRÁS Y REVELACIÓN */
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              {countdown !== null ? (
                <div className="space-y-4 animate-in zoom-in-50 duration-200">
                  <div className="w-24 h-24 rounded-full bg-amber-500/20 text-amber-600 border-2 border-amber-500 flex items-center justify-center text-5xl font-black mx-auto shadow-xl">
                    {countdown === 0 ? "¡YA!" : countdown}
                  </div>
                  <h4 className="text-lg font-bold text-foreground">
                    Seleccionando ganadores criptográficamente...
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Algoritmo aleatorio CSPRNG neutral certificado por misarroces.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 w-full max-w-md mx-auto">
                  <Trophy className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                  <h4 className="text-xl font-black text-foreground">
                    ¡Ganadores seleccionados!
                  </h4>
                  <div className="space-y-2">
                    {drawnResults?.winners.slice(0, revealedWinnersCount).map((w: any) => (
                      <div
                        key={w.id}
                        className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            #{w.position}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            @{w.user?.username || "ganador"}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold">¡Ganador!</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : tab === "participants" ? (
            /* LISTA DE PARTICIPANTES */
            <div className="space-y-4">
              {/* Filtros y Buscador */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Todos ({participants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("eligible")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filter === "eligible" ? "bg-emerald-500/15 text-emerald-600 shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Válidos ({eligibleCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("ineligible")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filter === "ineligible" ? "bg-amber-500/15 text-amber-600 shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Incompletos ({ineligibleCount})
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar participante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-input bg-background outline-none"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="divide-y divide-border/50 border border-border rounded-2xl overflow-hidden bg-card">
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((p) => (
                    <div key={p.userId} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-muted-foreground">
                              {p.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground truncate">
                              {p.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              @{p.username}
                            </span>
                          </div>
                          {p.isEligible ? (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Cumple todas las condiciones requeridas
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.missingCriteria.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.2 rounded-md"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {p.isEligible ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                            Elegible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                            No válido
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No hay participantes que coincidan con el filtro.
                  </div>
                )}
              </div>
            </div>
          ) : tab === "draw" ? (
            /* ACCIONES Y REALIZAR SORTEO */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h4 className="font-extrabold text-base text-foreground">
                    Realizar selección criptográfica oficial
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Al pulsar el botón, el servidor congelará el snapshot inmutable de participantes válidos ({eligibleCount} elegibles) y seleccionará de forma imparcial y definitiva a los {giveaway?.num_winners} ganadores y {giveaway?.num_alternates} suplentes.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDraw(true)}
                    disabled={eligibleCount === 0 || giveaway?.status === "CANCELLED"}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trophy className="w-4 h-4" />
                    Realizar sorteo ahora
                  </button>
                  {eligibleCount === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1 text-center font-medium">
                      Se necesita al menos 1 participante elegible para sortear.
                    </p>
                  )}
                </div>
              </div>

              {/* Cancelación */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Zona de cancelación
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(!showCancelPrompt)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    {showCancelPrompt ? "Ocultar" : "Cancelar este sorteo"}
                  </button>
                </div>
                {showCancelPrompt && (
                  <div className="pt-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Motivo de la cancelación (ej: Cancelado por fuerza mayor)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCancelGiveaway}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-xl hover:bg-destructive/90"
                    >
                      {isCancelling ? "Cancelando..." : "Confirmar cancelación"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* RESULTADOS CERTIFICADOS Y SUSTITUCIÓN */
            <div className="space-y-6">
              {/* Certificado link */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    CERTIFICADO OFICIAL
                  </span>
                  <div className="font-mono text-sm font-black text-foreground mt-1">
                    {certificateCode}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Resultado público e inmutable registrado en misarroces.
                  </span>
                </div>
                <Link
                  href={`/sorteos/${certificateCode}`}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ver Certificado
                </Link>
              </div>

              {/* Ganadores */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Ganadores Oficiales ({winners.length})</span>
                </h4>

                <div className="space-y-2">
                  {winners.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                          #{w.position}
                        </span>
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
                          <span className="font-bold text-sm text-foreground block truncate">
                            {w.user?.display_name || `@${w.user?.username}`}
                          </span>
                          <span className="text-xs text-muted-foreground block truncate">
                            @{w.user?.username}
                          </span>
                          {w.status === "REPLACED" && (
                            <span className="text-[11px] text-destructive font-semibold block mt-0.5">
                              Sustituido: {w.replacement_reason}
                            </span>
                          )}
                        </div>
                      </div>

                      {w.status === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingWinnerId(w.id)
                            setReplacementReason("")
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Sustituir</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suplentes */}
              {alternates.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Suplentes Oficiales ({alternates.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {alternates.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-2xl border border-border bg-muted/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center shrink-0">
                            #{a.position}
                          </span>
                          <span className="font-bold text-foreground truncate">
                            @{a.user?.username}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {a.status === "CLAIMED" ? "Promovido a ganador" : "En reserva"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación para realizar sorteo */}
      {showConfirmDraw && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="font-black text-lg text-foreground">
              ¿Realizar sorteo definitivo?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta selección generará el resultado oficial e inmutable. Se seleccionarán {giveaway?.num_winners} ganadores entre los {eligibleCount} participantes válidos.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDraw(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md"
              >
                Sortear ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para sustitución por suplente */}
      {replacingWinnerId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-base text-foreground">
                Sustituir ganador por suplente
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El ganador será sustituido por el siguiente suplente en orden correlativo. Esta sustitución y su motivo quedarán certificados públicamente.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Motivo de la sustitución <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ej: El ganador no ha respondido en el plazo de 48 horas establecido en las bases..."
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background outline-none resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplacingWinnerId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReplaceWinner}
                disabled={isReplacing || replacementReason.trim().length < 5}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md disabled:opacity-50"
              >
                {isReplacing ? "Sustituyendo..." : "Confirmar sustitución"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
