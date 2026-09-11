"use client"

import React, { useState } from "react"
import { AlertTriangle, Flag, Loader2, CheckCircle2, X } from "lucide-react"
import { createModerationReport, MODERATION_REASONS, ModerationTargetType } from "@/app/actions/moderation"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: ModerationTargetType
  targetId: string
  reportedUserId?: string | null
  contentSnapshot?: Record<string, any> | null
  title?: string
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  reportedUserId,
  contentSnapshot,
  title = "Reportar contenido"
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    if (isSubmitting) return
    setStatusMessage(null)
    setSelectedReason("")
    setDetails("")
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) {
      setStatusMessage({ type: "error", text: "Por favor, selecciona un motivo para el reporte." })
      return
    }

    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const result = await createModerationReport({
        targetType,
        targetId,
        reportedUserId,
        reason: selectedReason,
        details: details.trim() || undefined,
        contentSnapshot: contentSnapshot || undefined
      })

      if (result.success) {
        setStatusMessage({
          type: "success",
          text: result.message || "Gracias. Revisaremos este contenido."
        })
        setTimeout(() => {
          handleClose()
        }, 1800)
      } else {
        setStatusMessage({
          type: "error",
          text: result.message || "Hubo un problema al enviar tu reporte."
        })
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Ocurrió un error inesperado al procesar el reporte."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5 text-foreground font-semibold text-lg">
            <Flag className="w-5 h-5 text-amber-500" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage?.type === "success" ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-medium text-foreground text-base px-2">
              {statusMessage.text}
            </p>
            <p className="text-xs text-muted-foreground">
              Esta ventana se cerrará automáticamente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ¿Por qué quieres reportar esto?
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {MODERATION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-sm cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Detalles adicionales (opcional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Añade más contexto para que nuestro equipo pueda evaluar el reporte..."
                maxLength={500}
                rows={3}
                className="w-full text-sm bg-background border border-border rounded-2xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {statusMessage?.type === "error" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-2xl border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedReason}
                className="px-4 py-2 text-sm font-medium rounded-2xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar reporte</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
