"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, MicOff, Mic, Ban, ShieldCheck, Flag } from "lucide-react"
import { toggleMuteUser, unblockUserById } from "@/app/actions/settings"
import { blockUser } from "@/app/actions/social"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ReportModal } from "./ReportModal"
import { useRouter } from "next/navigation"

interface ProfileOptionsMenuProps {
  targetUserId: string
  targetUsername: string
  initialIsMuted?: boolean
  initialIsBlocked?: boolean
  isAuthenticated: boolean
}

export function ProfileOptionsMenu({
  targetUserId,
  targetUsername,
  initialIsMuted = false,
  initialIsBlocked = false,
  isAuthenticated,
}: ProfileOptionsMenuProps) {
  const router = useRouter()
  const { showAuthPrompt } = useAuthPrompt()
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(initialIsMuted)
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleToggleMute = async () => {
    if (!isAuthenticated) {
      showAuthPrompt("Inicia sesión para silenciar cuentas.")
      return
    }
    setIsOpen(false)
    setLoading(true)
    try {
      const res = await toggleMuteUser(targetUserId)
      setIsMuted(res.isMuted)
    } catch (err) {
      console.error("Error al cambiar estado de silencio:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockClick = () => {
    if (!isAuthenticated) {
      showAuthPrompt("Inicia sesión para bloquear usuarios.")
      return
    }
    setIsOpen(false)
    if (isBlocked) {
      handleUnblock()
    } else {
      setShowBlockConfirm(true)
    }
  }

  const handleConfirmBlock = async () => {
    setShowBlockConfirm(false)
    setLoading(true)
    try {
      await blockUser(targetUserId)
      setIsBlocked(true)
      router.refresh()
    } catch (err) {
      console.error("Error al bloquear usuario:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async () => {
    setLoading(true)
    try {
      await unblockUserById(targetUserId)
      setIsBlocked(false)
      router.refresh()
    } catch (err) {
      console.error("Error al desbloquear usuario:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReportClick = () => {
    if (!isAuthenticated) {
      showAuthPrompt("Inicia sesión para reportar un perfil.")
      return
    }
    setIsOpen(false)
    setShowReportModal(true)
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="h-10 w-10 border border-border bg-card rounded-full shadow-sm flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Más opciones"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 min-w-[210px] bg-card border border-border rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted font-medium transition-colors text-left"
          >
            {isMuted ? (
              <>
                <Mic className="w-4 h-4 text-emerald-500" />
                <span>Dejar de silenciar</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-muted-foreground" />
                <span>Silenciar cuenta</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBlockClick}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 font-medium transition-colors text-left"
          >
            {isBlocked ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-foreground">Desbloquear usuario</span>
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 text-destructive" />
                <span>Bloquear a @{targetUsername}</span>
              </>
            )}
          </button>

          <div className="h-px bg-border my-1" />

          <button
            type="button"
            onClick={handleReportClick}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-500/10 font-medium transition-colors text-left"
          >
            <Flag className="w-4 h-4 text-amber-500" />
            <span>Reportar perfil</span>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showBlockConfirm}
        title={`Bloquear a @${targetUsername}`}
        message="¿Seguro que quieres bloquear a este usuario? Dejaréis de seguiros mutuamente y no podréis ver vuestras publicaciones, recetas, historias ni enviaros mensajes."
        confirmText="Bloquear"
        isDestructive={true}
        onConfirm={handleConfirmBlock}
        onCancel={() => setShowBlockConfirm(false)}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="USER"
        targetId={targetUserId}
        reportedUserId={targetUserId}
        contentSnapshot={{ username: targetUsername }}
        title="Reportar perfil"
      />
    </div>
  )
}
