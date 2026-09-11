"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { ReportModal } from "./ReportModal"
import { ModerationTargetType } from "@/app/actions/moderation"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

interface ReportButtonProps {
  targetType: ModerationTargetType
  targetId: string
  reportedUserId?: string | null
  contentSnapshot?: Record<string, any> | null
  title?: string
  variant?: "icon" | "button" | "menuItem"
  label?: string
  className?: string
  isAuthenticated?: boolean
}

export function ReportButton({
  targetType,
  targetId,
  reportedUserId,
  contentSnapshot,
  title,
  variant = "icon",
  label = "Reportar",
  className = "",
  isAuthenticated = true
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { showAuthPrompt } = useAuthPrompt()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      showAuthPrompt("Inicia sesión para reportar contenido.")
      return
    }
    setIsOpen(true)
  }

  return (
    <>
      {variant === "menuItem" ? (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted font-medium text-muted-foreground hover:text-foreground transition-colors ${className}`}
        >
          <Flag className="w-4 h-4 text-amber-500" />
          <span>{label}</span>
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm ${className}`}
        >
          <Flag className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          title={label}
          className={`p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${className}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      )}

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetType={targetType}
        targetId={targetId}
        reportedUserId={reportedUserId}
        contentSnapshot={contentSnapshot}
        title={title || `Reportar ${label.toLowerCase()}`}
      />
    </>
  )
}
