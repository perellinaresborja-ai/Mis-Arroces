"use client"

import React, { useState, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Users,
  UserPlus,
  Loader2,
  Search,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getUserInviteInfoAction,
  matchContactsAction,
  followAllMatchesAction,
  MatchedContactUser,
  UnmatchedContactItem,
  UserInviteInfo,
} from "@/app/actions/contacts"
import { toggleFollow } from "@/app/actions/social"
import Link from "next/link"

interface FindFriendsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "invite" | "contacts" | "search"
}

export function FindFriendsModal({ isOpen, onClose, initialTab = "invite" }: FindFriendsModalProps) {
  const [activeTab, setActiveTab] = useState<"invite" | "contacts" | "search">(initialTab)
  const [isMounted, setIsMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  // Invite Info State
  const [inviteInfo, setInviteInfo] = useState<UserInviteInfo | null>(null)
  const [isLoadingInvite, setIsLoadingInvite] = useState(false)

  // Contacts Matching State
  const [supportsContactPicker, setSupportsContactPicker] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<MatchedContactUser[]>([])
  const [unmatchedContacts, setUnmatchedContacts] = useState<UnmatchedContactItem[]>([])
  const [hasScannedContacts, setHasScannedContacts] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [isFollowingAll, setIsFollowingAll] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setIsMounted(true)
    // Check real Contact Picker API support (Chromium Android / TWA)
    const supported =
      typeof window !== "undefined" &&
      "contacts" in navigator &&
      "ContactsManager" in window &&
      typeof (navigator as any).contacts?.select === "function"
    setSupportsContactPicker(supported)
  }, [])

  // Load user's invite info when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      loadInviteInfo()
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const loadInviteInfo = async () => {
    if (inviteInfo) return
    setIsLoadingInvite(true)
    try {
      const res = await getUserInviteInfoAction()
      if (res.success) {
        setInviteInfo(res)
      }
    } catch (err) {
      console.error("Error loading invite info:", err)
    } finally {
      setIsLoadingInvite(false)
    }
  }

  const inviteUrl = inviteInfo?.inviteUrl || "https://www.misarroces.es"
  const shareMessage = `¡Hola! Te invito a unirte a misarroces para compartir y descubrir las mejores recetas de arroz: ${inviteUrl}`

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "misarroces",
          text: "¡Únete a misarroces para compartir y descubrir recetas de arroz!",
          url: inviteUrl,
        })
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleWhatsAppShare = (phone?: string) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : ""
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  // Trigger Native Contact Picker API
  const handlePickContacts = async () => {
    setContactError(null)
    try {
      const navContacts = (navigator as any).contacts
      // Check which properties are supported
      let propsToRequest = ["name", "email", "tel"]
      if (typeof navContacts.getProperties === "function") {
        try {
          const supportedProps: string[] = await navContacts.getProperties()
          propsToRequest = propsToRequest.filter((p) => supportedProps.includes(p))
        } catch {
          // fallback to standard
        }
      }

      const selected = await navContacts.select(propsToRequest, { multiple: true })

      if (!Array.isArray(selected) || selected.length === 0) {
        return
      }

      setIsMatching(true)
      const rawContacts = selected.map((s: any) => ({
        name: Array.isArray(s.name) ? s.name[0] : s.name || "",
        email: Array.isArray(s.email) ? s.email[0] : s.email || undefined,
        tel: Array.isArray(s.tel) ? s.tel[0] : s.tel || undefined,
      }))

      const matchRes = await matchContactsAction(rawContacts)
      setHasScannedContacts(true)

      if (matchRes.success) {
        setMatchedUsers(matchRes.matched)
        setUnmatchedContacts(matchRes.unmatched)

        // Initialize follow map
        const initialFollowMap: Record<string, boolean> = {}
        for (const m of matchRes.matched) {
          initialFollowMap[m.id] = m.isFollowing
        }
        setFollowingMap(initialFollowMap)
      } else {
        setContactError(matchRes.error || "No se pudieron comprobar los contactos.")
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Contact picker error:", err)
        setContactError("No se pudo acceder a la agenda en este dispositivo.")
      }
    } finally {
      setIsMatching(false)
    }
  }

  // Toggle follow single user
  const handleToggleFollow = async (userId: string, isPrivate: boolean) => {
    const isCurrentlyFollowing = !!followingMap[userId]
    // Optimistic update
    setFollowingMap((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }))

    try {
      await toggleFollow(userId, isPrivate, isCurrentlyFollowing ? "ACCEPTED" : null)
    } catch (err) {
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }))
    }
  }

  // Follow all matched users
  const handleFollowAll = async () => {
    const unfollowedIds = matchedUsers
      .filter((m) => !followingMap[m.id])
      .map((m) => m.id)

    if (unfollowedIds.length === 0) return

    setIsFollowingAll(true)
    // Optimistic update
    setFollowingMap((prev) => {
      const next = { ...prev }
      for (const id of unfollowedIds) next[id] = true
      return next
    })

    try {
      await followAllMatchesAction(unfollowedIds)
    } catch (err) {
      console.error("Error following all matches:", err)
    } finally {
      setIsFollowingAll(false)
    }
  }

  // Live search users by query
  useEffect(() => {
    const query = searchQuery.trim().replace(/^@/, "").toLowerCase()
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)")
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(10)

        startTransition(() => {
          setSearchResults(data || [])
        })
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen || !isMounted) return null

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    inviteUrl
  )}&color=000000&bgcolor=ffffff`

  const unfollowedCount = matchedUsers.filter((m) => !followingMap[m.id]).length

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-foreground">Encuentra a tus amigos</h2>
              <p className="text-[11px] text-muted-foreground">Conecta e invita a tus conocidos en misarroces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-2xl my-3 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab("invite")}
            className={`py-2 px-2 rounded-xl transition-all text-center ${
              activeTab === "invite" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Invitar
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`py-2 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === "contacts" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agenda
            {supportsContactPicker && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2 px-2 rounded-xl transition-all text-center ${
              activeTab === "search" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buscar
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-0.5">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PESTAÑA 1: INVITAR Y COMPARTIR ENLACE                     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "invite" && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              {/* Tarjeta de Enlace Personal */}
              <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tu enlace personal
                  </span>
                  {inviteInfo && inviteInfo.referralsCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      🎉 {inviteInfo.referralsCount}{" "}
                      {inviteInfo.referralsCount === 1 ? "invitado" : "invitados"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 sm:p-2.5">
                  <span className="text-xs font-mono text-foreground truncate flex-1 select-all px-1">
                    {inviteUrl}
                  </span>
                  <Button
                    size="sm"
                    variant={copied ? "default" : "secondary"}
                    onClick={handleCopyLink}
                    className="h-8 px-3 rounded-lg font-bold text-xs shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Cuando alguien se registre con tu enlace, te seguirá automáticamente y quedará registrado como tu invitado en misarroces.
                </p>
              </div>

              {/* Botones de Acción Inmediata */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleWhatsAppShare()}
                  className="w-full h-11 rounded-2xl font-bold bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Invitar por WhatsApp</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleNativeShare}
                    className="h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowQr(!showQr)}
                    className="h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? "Ocultar QR" : "Ver Código QR"}</span>
                  </Button>
                </div>
              </div>

              {/* Código QR Opcional */}
              {showQr && (
                <div className="p-4 bg-card border border-border rounded-2xl flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-150">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="QR misarroces" className="w-40 h-40 object-contain" />
                  </div>
                  <span className="text-[11px] text-muted-foreground text-center">
                    Escanéalo con la cámara de otro móvil para unirse a misarroces
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PESTAÑA 2: AGENDA DE CONTACTOS (Contact Picker API)        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "contacts" && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              {supportsContactPicker ? (
                <>
                  <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-foreground">
                          Selección privada y voluntaria
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Tú eliges qué contactos comprobar. Solo contrastamos si ya tienen cuenta en misarroces para que puedas seguirles o invitarles. Tu agenda nunca se almacena en el servidor.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handlePickContacts}
                      disabled={isMatching}
                      className="w-full h-11 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Comprobando contactos...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Seleccionar contactos de mi agenda</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {contactError && (
                    <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-xl text-center font-medium">
                      {contactError}
                    </div>
                  )}

                  {/* Resultados de la comprobación */}
                  {hasScannedContacts && (
                    <div className="space-y-4 pt-1">
                      {/* Ya en misarroces */}
                      {matchedUsers.length > 0 && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Ya están en misarroces ({matchedUsers.length})
                            </span>
                            {unfollowedCount > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleFollowAll}
                                disabled={isFollowingAll}
                                className="h-7 px-2.5 rounded-lg text-xs font-bold"
                              >
                                {isFollowingAll ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <CheckCheck className="w-3 h-3 mr-1" />
                                )}
                                Seguir a todos ({unfollowedCount})
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {matchedUsers.map((u) => {
                              const isFollowing = !!followingMap[u.id]
                              return (
                                <div
                                  key={u.id}
                                  className="flex items-center justify-between p-2.5 bg-card border border-border rounded-2xl"
                                >
                                  <Link
                                    href={`/@${u.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                                      {u.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10 text-sm">
                                          {u.username[0].toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-xs text-foreground truncate">
                                        {u.displayName || u.username}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground truncate">
                                        @{u.username}
                                        {u.contactName && u.contactName !== u.displayName && (
                                          <span className="opacity-70 ml-1">({u.contactName})</span>
                                        )}
                                      </p>
                                    </div>
                                  </Link>

                                  <Button
                                    size="sm"
                                    variant={isFollowing ? "secondary" : "default"}
                                    onClick={() => handleToggleFollow(u.id, u.privacyLevel === "PRIVATE")}
                                    className="h-8 px-3 rounded-xl font-bold text-xs shrink-0"
                                  >
                                    {isFollowing ? (
                                      <>
                                        <Check className="w-3 h-3 mr-1 text-emerald-600" />
                                        Siguiendo
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="w-3 h-3 mr-1" />
                                        Seguir
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Contactos para Invitar */}
                      {unmatchedContacts.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                            Aún no están en misarroces ({unmatchedContacts.length})
                          </span>

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {unmatchedContacts.map((c, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-2xl"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="font-bold text-xs text-foreground truncate">{c.name}</p>
                                  {c.tel && <p className="text-[10px] text-muted-foreground font-mono">{c.tel}</p>}
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleWhatsAppShare(c.tel)}
                                  className="h-8 px-3 rounded-xl font-bold text-xs shrink-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Invitar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedUsers.length === 0 && unmatchedContacts.length === 0 && (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No se han seleccionado contactos válidos.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Fallback limpio para dispositivos sin Contact Picker (iOS, Desktop) */
                <div className="bg-muted/30 border border-border/80 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">Invita a tus contactos fácilmente</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      La selección directa desde la agenda nativa está optimizada para la app de Android. Puedes invitar a cualquiera de tus amigos de forma inmediata compartiendo tu enlace.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={() => handleWhatsAppShare()}
                      className="rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Enviar por WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="rounded-xl font-bold text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                          ¡Enlace copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copiar enlace
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PESTAÑA 3: BÚSQUEDA RÁPIDA POR NOMBRE / USUARIO           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "search" && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por nombre o @usuario..."
                  className="pl-9 h-11 rounded-2xl bg-card border-border text-sm"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 pt-1">
                  {searchResults.map((u) => {
                    const avatarUrl = u.avatar?.storage_path
                      ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${u.avatar.storage_path}`
                      : null
                    const isFollowing = !!followingMap[u.id]

                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2.5 bg-card border border-border rounded-2xl"
                      >
                        <Link
                          href={`/@${u.username}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10 text-sm">
                                {u.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-foreground truncate">{u.display_name || u.username}</p>
                            <p className="text-[11px] text-muted-foreground truncate">@{u.username}</p>
                          </div>
                        </Link>

                        <Button
                          size="sm"
                          variant={isFollowing ? "secondary" : "default"}
                          onClick={() => handleToggleFollow(u.id, u.privacy_level === "PRIVATE")}
                          className="h-8 px-3 rounded-xl font-bold text-xs shrink-0"
                        >
                          {isFollowing ? (
                            <>
                              <Check className="w-3 h-3 mr-1 text-emerald-600" />
                              Siguiendo
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 mr-1" />
                              Seguir
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    No se han encontrado arroceros que coincidan con &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("invite")}
                    className="rounded-xl font-bold text-xs"
                  >
                    Invítale con tu enlace
                  </Button>
                </div>
              )}

              {searchQuery.trim().length < 2 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar amigos en misarroces.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
