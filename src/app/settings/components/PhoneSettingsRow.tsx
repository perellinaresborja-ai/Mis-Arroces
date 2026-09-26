"use client"

import React, { useState, useEffect } from "react"
import { Phone, ChevronRight, X, Loader2, Check, Trash2, ShieldCheck } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { formatPhoneDisplay } from "@/lib/phone"
import {
  getUserPhoneAction,
  updateUserPhoneAction,
  deleteUserPhoneAction,
} from "@/app/actions/user-phone"

export function PhoneSettingsRow() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [phoneE164, setPhoneE164] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState<string>("ES")
  const [inputVal, setInputVal] = useState<string>("")
  const [isValidPhone, setIsValidPhone] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    setIsMounted(true)
    loadPhone()
  }, [])

  const loadPhone = async () => {
    setLoading(true)
    try {
      const res = await getUserPhoneAction()
      if (res.success) {
        setPhoneE164(res.phoneE164)
        setInputVal(res.phoneE164 || "")
        if (res.countryCode) setCountryCode(res.countryCode)
      }
    } catch (err) {
      console.error("Error loading phone:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setStatusMessage(null)
    setInputVal(phoneE164 || "")
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!inputVal.trim()) {
      handleDelete()
      return
    }

    setSaving(true)
    setStatusMessage(null)
    try {
      const res = await updateUserPhoneAction(inputVal, countryCode)
      if (res.success) {
        setPhoneE164(res.e164 || null)
        setStatusMessage({ type: "success", text: "Teléfono actualizado correctamente." })
        setTimeout(() => setIsOpen(false), 1200)
      } else {
        setStatusMessage({ type: "error", text: res.error || "Error al guardar el teléfono." })
      }
    } catch {
      setStatusMessage({ type: "error", text: "Error de conexión." })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setStatusMessage(null)
    try {
      const res = await deleteUserPhoneAction()
      if (res.success) {
        setPhoneE164(null)
        setInputVal("")
        setStatusMessage({ type: "success", text: "Teléfono eliminado." })
        setTimeout(() => setIsOpen(false), 1200)
      } else {
        setStatusMessage({ type: "error", text: res.error || "Error al eliminar el teléfono." })
      }
    } catch {
      setStatusMessage({ type: "error", text: "Error de conexión." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <span className="font-medium text-sm text-foreground block">
              Teléfono (privado)
            </span>
            <span className="text-[11px] text-muted-foreground block font-mono">
              {phoneE164 ? formatPhoneDisplay(phoneE164) : "No añadido"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phoneE164 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Activo
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </button>

      {isOpen && isMounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Teléfono privado</h3>
                  <p className="text-[11px] text-muted-foreground">Privacidad y búsqueda de amigos</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso de privacidad */}
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-3 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tu número nunca será público ni aparecerá en tu perfil. Solo sirve para que tus amigos que ya tengan tu número en su agenda puedan encontrarte en misarroces.
              </p>
            </div>

            {/* Selector de Teléfono */}
            <div className="space-y-2">
              <label htmlFor="settings-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Número de teléfono
              </label>
              <PhoneInput
                id="settings-phone"
                name="settings_phone"
                value={inputVal}
                defaultCountry={countryCode}
                onChange={(e164, valid) => {
                  setInputVal(e164)
                  setIsValidPhone(valid)
                }}
              />
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium text-center ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Acciones */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSave}
                disabled={saving || !isValidPhone}
                className="w-full h-11 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Guardar teléfono</span>
              </Button>

              {phoneE164 && (
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={saving}
                  className="w-full h-10 rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar número</span>
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
