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
  ArrowRight,
  Volume2,
  VolumeX,
  Share2,
  Video,
  FileText,
  Disc,
  List,
  Timer
} from "lucide-react"
import {
  getGiveawayParticipantsServer,
  drawGiveawayWinners,
  replaceWinnerWithAlternate,
  cancelGiveaway
} from "@/app/actions/giveaways"
import { GiveawayParticipant, Giveaway } from "@/types/giveaway"
import { GiveawayWheel } from "./giveaway/GiveawayWheel"
import { GiveawayNamesRoll } from "./giveaway/GiveawayNamesRoll"
import { GiveawayCountdown } from "./giveaway/GiveawayCountdown"
import { GiveawayShareCard } from "./giveaway/GiveawayShareCard"
import { GiveawayVideoGenerator } from "./giveaway/GiveawayVideoGenerator"
import { giveawaySound } from "./giveaway/GiveawaySound"

interface GiveawayManagementModalProps {
  giveawayId: string
  certificateCode: string
  isOpen: boolean
  onClose: () => void
  initialTab?: "participants" | "draw" | "results"
}

type RevealMode = "wheel" | "names" | "countdown"
type DrawStep = "ready" | "select_mode" | "revealing" | "finished"

export function GiveawayManagementModal({
  giveawayId,
  certificateCode,
  isOpen,
  onClose,
  initialTab
}: GiveawayManagementModalProps) {
  const [tab, setTab] = useState<"participants" | "draw" | "results">(initialTab || "participants")
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [participants, setParticipants] = useState<GiveawayParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "eligible" | "ineligible">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Flujo visual del Sorteo
  const [drawStep, setDrawStep] = useState<DrawStep>("ready")
  const [revealMode, setRevealMode] = useState<RevealMode>("wheel")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isServerDrawing, setIsServerDrawing] = useState(false)
  const [drawnWinners, setDrawnWinners] = useState<any[]>([])
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0)
  const [currentWinnerRevealed, setCurrentWinnerRevealed] = useState(false)

  // Modales secundarios de compartir y vídeo
  const [activeMediaModal, setActiveMediaModal] = useState<"share_card" | "video" | null>(null)

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
        const existingWinners = (res.giveaway.results || []).filter((r: any) => r.role === "WINNER")
        setDrawnWinners(existingWinners)
      } else if (initialTab) {
        setTab(initialTab)
      }
    } catch (err: any) {
      setActionError(err.message || "Error al cargar datos del sorteo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setTab(initialTab)
      loadData()
    }
  }, [isOpen, giveawayId, initialTab])

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
  const eligibleUsernames = participants.filter((p) => p.isEligible).map((p) => p.username)
  const ineligibleCount = participants.length - eligibleCount

  // Iniciar ejecución: Servidor decide ANTES de que comience cualquier animación
  const handleStartDrawExecution = async () => {
    setActionError(null)
    setIsServerDrawing(true)

    try {
      let winnersToUse = drawnWinners

      // Solo llamar a drawGiveawayWinners si el sorteo aún no está DRAWN
      if (!giveaway || giveaway.status !== "DRAWN") {
        const res = await drawGiveawayWinners(giveawayId)
        winnersToUse = res.winners
        setDrawnWinners(res.winners)
        await loadData()
      }

      // Con el resultado persistido en el servidor, iniciamos la revelación secuencial
      setCurrentWinnerIndex(0)
      setCurrentWinnerRevealed(false)
      setDrawStep("revealing")
    } catch (err: any) {
      setActionError(err.message || "Error al realizar el sorteo")
    } finally {
      setIsServerDrawing(false)
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
  const currentRevealingWinner = drawnWinners[currentWinnerIndex] || winners[currentWinnerIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold shadow-sm">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground">
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
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="flex border-b border-border px-5 gap-4 shrink-0 text-sm font-semibold bg-muted/20">
          <button
            type="button"
            onClick={() => setTab("participants")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === "draw"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Realizar Sorteo</span>
            </button>
          )}
        </div>

        {/* Error global de acción si ocurre */}
        {actionError && (
          <div className="m-4 p-3.5 bg-destructive/10 text-destructive text-xs rounded-2xl border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{actionError}</div>
          </div>
        )}

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-xs">Cargando censo oficial del sorteo...</span>
            </div>
          ) : tab === "participants" ? (
            /* TAB 1: LISTADO DE PARTICIPANTES */
            <div className="space-y-4">
              {/* Barra de filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar participante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/40 border border-input text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Todos ({participants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("eligible")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      filter === "eligible" ? "bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Válidos ({eligibleCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("ineligible")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      filter === "ineligible" ? "bg-card text-destructive shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Incompletos ({ineligibleCount})
                  </button>
                </div>
              </div>

              {/* Lista de participantes con checklist */}
              <div className="space-y-2">
                {filteredParticipants.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-border">
                    No se encontraron participantes en este filtro.
                  </div>
                ) : (
                  filteredParticipants.map((p) => {
                    return (
                      <div
                        key={p.userId}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {p.username[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate block">
                              {p.displayName || p.username}
                            </span>
                            <span className="text-[11px] text-muted-foreground">@{p.username}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              p.isEligible
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {p.isEligible ? "Apto" : "Incompleto"}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : tab === "draw" ? (
            /* TAB 2: EXPERIENCIA VISUAL DEL SORTEO */
            <div className="space-y-6">
              {/* PASO 1: SORTEO PREPARADO */}
              {drawStep === "ready" && (
                <div className="p-6 rounded-3xl bg-muted/20 border border-border text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground">
                      SORTEO PREPARADO
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Todo listo para realizar la extracción certificada.
                    </p>
                  </div>

                  {/* Resumen de censo */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <div className="p-3 rounded-2xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Evaluados
                      </span>
                      <span className="text-xl font-black text-foreground">
                        {participants.length}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                        Válidos (Aptos)
                      </span>
                      <span className="text-xl font-black text-emerald-600">
                        {eligibleCount}
                      </span>
                    </div>
                  </div>

                  {eligibleCount === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                      No hay participantes que cumplan todas las condiciones requeridas. No es posible realizar el sorteo.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDrawStep("select_mode")}
                      className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* PASO 2: ¿CÓMO QUIERES DESCUBRIR AL GANADOR? */}
              {drawStep === "select_mode" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-foreground">
                      ¿CÓMO QUIERES DESCUBRIR AL GANADOR?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Elige el modo de presentación visual. La extracción se realiza de forma segura y criptográfica en el servidor.
                    </p>
                  </div>

                  {/* Selector de los 3 modos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRevealMode("wheel")}
                      className={`p-4 rounded-2xl border text-center space-y-2.5 transition-all cursor-pointer ${
                        revealMode === "wheel"
                          ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                          : "bg-card border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto">
                        <Disc className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-foreground">RULETA</div>
                        <div className="text-[11px] text-muted-foreground">Giro dinámico y suspense con aguja</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRevealMode("names")}
                      className={`p-4 rounded-2xl border text-center space-y-2.5 transition-all cursor-pointer ${
                        revealMode === "names"
                          ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                          : "bg-card border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mx-auto">
                        <List className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-foreground">NOMBRES</div>
                        <div className="text-[11px] text-muted-foreground">Carrusel vertical slot machine</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRevealMode("countdown")}
                      className={`p-4 rounded-2xl border text-center space-y-2.5 transition-all cursor-pointer ${
                        revealMode === "countdown"
                          ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                          : "bg-card border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center mx-auto">
                        <Timer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-foreground">3 · 2 · 1</div>
                        <div className="text-[11px] text-muted-foreground">Cuenta atrás limpia y cinematográfica</div>
                      </div>
                    </button>
                  </div>

                  {/* Control de sonido */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>Sonido de revelación</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        soundEnabled
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {soundEnabled ? "Activado" : "Desactivado"}
                    </button>
                  </div>

                  {/* Botón de inicio */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawStep("ready")}
                      className="px-4 py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={handleStartDrawExecution}
                      disabled={isServerDrawing}
                      className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isServerDrawing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Certificando en servidor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Comenzar Sorteo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: REVELACIÓN VISUAL (RULETA / NOMBRES / 3-2-1) */}
              {drawStep === "revealing" && currentRevealingWinner && (
                <div className="space-y-6 text-center animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-black tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      GANADOR {currentWinnerIndex + 1} DE {drawnWinners.length || 1}
                    </span>
                    <h3 className="text-base font-extrabold text-foreground pt-1">
                      {giveaway?.title}
                    </h3>
                  </div>

                  {/* Componente del modo seleccionado */}
                  {revealMode === "wheel" && (
                    <GiveawayWheel
                      winnerUsername={currentRevealingWinner.user?.username || currentRevealingWinner.username}
                      winnerDisplayName={currentRevealingWinner.user?.display_name || currentRevealingWinner.displayName}
                      winnerAvatarUrl={
                        currentRevealingWinner.user?.avatar?.storage_path
                          ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentRevealingWinner.user.avatar.storage_path}`
                          : null
                      }
                      eligibleUsernames={eligibleUsernames}
                      soundEnabled={soundEnabled}
                      onFinish={() => setCurrentWinnerRevealed(true)}
                    />
                  )}

                  {revealMode === "names" && (
                    <GiveawayNamesRoll
                      winnerUsername={currentRevealingWinner.user?.username || currentRevealingWinner.username}
                      winnerDisplayName={currentRevealingWinner.user?.display_name || currentRevealingWinner.displayName}
                      winnerAvatarUrl={
                        currentRevealingWinner.user?.avatar?.storage_path
                          ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentRevealingWinner.user.avatar.storage_path}`
                          : null
                      }
                      eligibleUsernames={eligibleUsernames}
                      soundEnabled={soundEnabled}
                      onFinish={() => setCurrentWinnerRevealed(true)}
                    />
                  )}

                  {revealMode === "countdown" && (
                    <GiveawayCountdown
                      winnerUsername={currentRevealingWinner.user?.username || currentRevealingWinner.username}
                      winnerDisplayName={currentRevealingWinner.user?.display_name || currentRevealingWinner.displayName}
                      winnerAvatarUrl={
                        currentRevealingWinner.user?.avatar?.storage_path
                          ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentRevealingWinner.user.avatar.storage_path}`
                          : null
                      }
                      soundEnabled={soundEnabled}
                      onFinish={() => setCurrentWinnerRevealed(true)}
                    />
                  )}

                  {/* Botón para avanzar si hay más ganadores o ir a resultados */}
                  {currentWinnerRevealed && (
                    <div className="pt-4 animate-in fade-in duration-300">
                      {currentWinnerIndex < drawnWinners.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentWinnerIndex((prev) => prev + 1)
                            setCurrentWinnerRevealed(false)
                          }}
                          className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          <span>Descubrir Siguiente Ganador ({currentWinnerIndex + 2}/{drawnWinners.length})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTab("results")}
                          className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Ver Resultados Oficiales y Certificado</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: RESULTADOS CERTIFICADOS Y COMPARTIR */
            <div className="space-y-6">
              {/* Composición Final: Ganadores Certificados */}
              <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-black text-base text-foreground">
                      SORTEO FINALIZADO
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                    Certificado Oficial
                  </span>
                </div>

                {/* Lista de Ganadores */}
                <div className="space-y-3">
                  {winners.map((winner) => {
                    const isReplaced = winner.status === "REPLACED"
                    const avatar = winner.user?.avatar?.storage_path
                      ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${winner.user.avatar.storage_path}`
                      : null

                    return (
                      <div
                        key={winner.id}
                        className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 ${
                          isReplaced ? "bg-muted/40 border-border opacity-70" : "bg-card border-emerald-500/30 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {winner.position}º
                          </span>

                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                            {avatar ? (
                              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-muted-foreground">
                                {winner.user?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-foreground block truncate">
                              {winner.user?.display_name || winner.user?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{winner.user?.username}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isReplaced ? (
                            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              Sustituido
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplacingWinnerId(winner.id)
                                setReplacementReason("")
                              }}
                              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border hover:bg-muted"
                            >
                              Sustituir
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Suplentes si existen */}
              {alternates.length > 0 && (
                <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="uppercase tracking-wider">Suplentes Oficiales</span>
                    <span>{alternates.length} extraídos</span>
                  </div>

                  <div className="space-y-1.5">
                    {alternates.map((alt) => (
                      <div
                        key={alt.id}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-card border border-border/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground">S{alt.position}</span>
                          <span className="font-semibold text-foreground">@{alt.user?.username}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {alt.status === "CLAIMED" ? "Promovido a ganador" : "En reserva"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de Acciones Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaModal("share_card")}
                  className="py-3 px-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMediaModal("video")}
                  className="py-3 px-3 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-md hover:bg-amber-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Generar Vídeo (9:16)</span>
                </button>

                <Link
                  href={`/sorteos/${certificateCode}`}
                  target="_blank"
                  className="py-3 px-3 rounded-2xl bg-muted text-foreground font-bold text-xs border border-border hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ver Certificado</span>
                </Link>
              </div>

              {/* Modal de Tarjeta Compartible */}
              {activeMediaModal === "share_card" && winners.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Tarjeta Visual Oficial
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActiveMediaModal(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cerrar
                    </button>
                  </div>
                  <GiveawayShareCard
                    title={giveaway?.title || "Sorteo Oficial"}
                    prize={giveaway?.prize || "Premio"}
                    winnerUsername={winners[0].user?.username || "ganador"}
                    winnerDisplayName={winners[0].user?.display_name || ""}
                    winnerAvatarUrl={
                      winners[0].user?.avatar?.storage_path
                        ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${winners[0].user.avatar.storage_path}`
                        : null
                    }
                    organizerUsername={giveaway?.organizer?.username || "organizador"}
                    certificateCode={certificateCode}
                  />
                </div>
              )}

              {/* Modal de Generador de Vídeo */}
              {activeMediaModal === "video" && winners.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Vídeo 9:16 con Código QR
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActiveMediaModal(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cerrar
                    </button>
                  </div>
                  <GiveawayVideoGenerator
                    title={giveaway?.title || "Sorteo Oficial"}
                    prize={giveaway?.prize || "Premio"}
                    winnerUsername={winners[0].user?.username || "ganador"}
                    winnerDisplayName={winners[0].user?.display_name || ""}
                    winnerAvatarUrl={
                      winners[0].user?.avatar?.storage_path
                        ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${winners[0].user.avatar.storage_path}`
                        : null
                    }
                    organizerUsername={giveaway?.organizer?.username || "organizador"}
                    certificateCode={certificateCode}
                  />
                </div>
              )}

              {/* Diálogo de Sustitución */}
              {replacingWinnerId && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-destructive font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Sustituir Ganador por el siguiente Suplente</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El suplente en primera posición ascenderá automáticamente a ganador. Esta acción queda auditada y visible en el certificado público.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="Motivo obligatorio (ej: No responde tras 48 horas)"
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setReplacingWinnerId(null)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleReplaceWinner}
                      disabled={isReplacing || replacementReason.trim().length < 5}
                      className="px-4 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {isReplacing ? "Sustituyendo..." : "Confirmar Sustitución"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
