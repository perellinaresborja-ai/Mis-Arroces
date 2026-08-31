"use client"
import React from 'react'

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}>
      <div 
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={onCancel}
            className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 font-bold py-3 px-4 rounded-xl transition-colors ${isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
