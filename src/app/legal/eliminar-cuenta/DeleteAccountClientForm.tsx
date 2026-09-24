'use client'

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Loader2, Send, ShieldCheck, Trash2 } from "lucide-react"
import { requestAccountDeletionAction, confirmAccountDeletionAction } from "@/app/actions/legal"

export default function DeleteAccountClientForm() {
  const [step, setStep] = useState<"request" | "verify" | "done">("request")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [code, setCode] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage("Por favor, introduce tu correo electrónico.")
      return
    }

    if (!confirmed) {
      setErrorMessage("Debes confirmar la casilla de consentimiento para continuar.")
      return
    }

    setLoading(true)
    try {
      const res = await requestAccountDeletionAction({
        email,
        username,
        reason,
        confirmed,
      })

      if (!res.success) {
        setErrorMessage(res.error || "No se ha podido procesar la solicitud.")
      } else {
        setStep("verify")
      }
    } catch (err: any) {
      setErrorMessage("Ha ocurrido un error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage("Por favor, introduce el código de 6 dígitos que has recibido.")
      return
    }

    setLoading(true)
    try {
      const res = await confirmAccountDeletionAction({
        email,
        code: code.trim(),
      })

      if (!res.success) {
        setErrorMessage(res.error || "El código introducido no es válido o ha expirado.")
      } else {
        setStep("done")
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión al verificar el código.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
      {step === "request" && (
        <form onSubmit={handleRequestSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">
              Formulario de Solicitud de Supresión
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Completa este formulario si ya no dispones de la app en tu teléfono o no puedes acceder a Ajustes.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="del-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Correo electrónico de tu cuenta *
            </label>
            <input
              id="del-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition"
            />
            <p className="text-[11px] text-muted-foreground">
              Te enviaremos un código de seguridad a esta dirección para verificar que eres el titular legítimo.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="del-username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nombre de usuario (@usuario) <span className="font-normal lowercase text-muted-foreground/70">(opcional)</span>
            </label>
            <input
              id="del-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@tu_usuario"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="del-reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Motivo de la baja <span className="font-normal lowercase text-muted-foreground/70">(opcional)</span>
            </label>
            <textarea
              id="del-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="¿Hay algo en lo que podamos mejorar?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-[#EA580C] focus:ring-[#EA580C]/30 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Confirmo que deseo solicitar la eliminación de mi cuenta en <strong>misarroces</strong>. Entiendo que esta acción es definitiva y conllevará la supresión de mis fotos, publicaciones, mensajes y perfil.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !confirmed}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />
                <span>Procesando solicitud...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" focusable="false" />
                <span>Solicitar código de eliminación</span>
              </>
            )}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerifySubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              Paso 2: Verificación de Identidad
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Introduce el código de verificación
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hemos enviado un código numérico de 6 dígitos a <strong>{email}</strong>. Si no lo ves en tu bandeja de entrada, revisa la carpeta de correo no deseado (spam).
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="del-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Código de 6 dígitos *
            </label>
            <input
              id="del-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center tracking-[0.5em] font-mono font-black text-2xl px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep("request")
                setCode("")
                setErrorMessage(null)
              }}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-muted hover:bg-muted/80 text-foreground transition"
            >
              Cambiar correo / Volver
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />
                  <span>Eliminando cuenta...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                  <span>Confirmar y Eliminar Cuenta</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" aria-hidden="true" focusable="false" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Cuenta eliminada correctamente
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tu cuenta, perfil y datos personales asociados han sido suprimidos de manera definitiva e irreversible de los servidores de misarroces conforme al RGPD.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Volver a la página principal
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
