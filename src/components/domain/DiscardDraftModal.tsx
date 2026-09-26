"use client"

import React from "react"

interface DiscardDraftModalProps {
  isOpen: boolean
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DiscardDraftModal({
  isOpen,
  title = "¿Descartar publicación?",
  description = "Si sales ahora, perderás los cambios.",
  cancelText = "Seguir editando",
  confirmText = "Descartar",
  onCancel,
  onConfirm
}: DiscardDraftModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xs rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center animate-in zoom-in-95 duration-200">
        <div>
          <h3 className="text-xl font-bold font-serif text-foreground mb-1.5">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex flex-col gap-2.5 mt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="w-full py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-2xl transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
