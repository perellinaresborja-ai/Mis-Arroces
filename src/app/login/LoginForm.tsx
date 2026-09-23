"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { login, signup } from "./actions"
import { useFormStatus } from "react-dom"

export function LoginForm({ initialMode = "login", error, message, redirectTo }: { initialMode?: "login" | "signup", error?: string, message?: string, redirectTo?: string }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  useEffect(() => {
    if (initialMode) setMode(initialMode)
  }, [initialMode])
  const [showPassword, setShowPassword] = useState(false)
  const [acqData, setAcqData] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem("acq_data")
      if (data) {
        setAcqData(data)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
      {/* Mode Selector Tabs (clean and matching Mis Arroces style) */}
      <div className="flex p-1 mb-4 bg-muted/60 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
            mode === "login"
              ? "bg-card text-charcoal shadow-sm border border-border"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
            mode === "signup"
              ? "bg-card text-charcoal shadow-sm border border-border"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form action={mode === "login" ? login : signup} className="space-y-4 relative z-10" noValidate>
        <input type="hidden" name="acquisition_data" value={acqData} />
        <input type="hidden" name="redirect" value={redirectTo || ""} />
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl text-center font-medium border border-destructive/20 space-y-1">
            <p>{error}</p>
            {error.includes("Ya existe una cuenta") && (
              <div className="pt-1 flex items-center justify-center gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Iniciar sesión
                </button>
                <span className="text-muted-foreground">•</span>
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Recuperar contraseña
                </Link>
              </div>
            )}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-500/10 rounded-xl text-center font-medium border border-green-500/20">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-charcoal block">
              Correo electrónico
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="tu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base" 
            />
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-charcoal block">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                autoComplete={mode === "login" ? "current-password" : "new-password"} 
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={mode === "login" ? "••••••••" : "Mínimo 6 caracteres"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-12 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base font-medium tracking-wide" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-charcoal transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {mode === "login" && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="remember" className="peer appearance-none w-5 h-5 border-2 border-charcoal/40 bg-white rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer" defaultChecked />
                <svg className="absolute w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-charcoal transition-colors">Recuérdame</span>
            </label>

            <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
        
        {mode === "signup" && (
          <div className="space-y-4 pt-2 pb-2">
            <div className="flex items-start gap-3">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  name="legal_accepted" 
                  id="legal_accepted"
                  required
                  className="peer appearance-none w-5 h-5 border-2 border-charcoal/40 bg-white rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <label htmlFor="legal_accepted" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                He leído y acepto los <Link href="/legal/terms" target="_blank" className="font-bold text-primary hover:underline">Términos de servicio</Link> y confirmo haber leído la <Link href="/legal/privacy" target="_blank" className="font-bold text-primary hover:underline">Política de privacidad</Link>.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  name="age_18_confirmed" 
                  id="age_18_confirmed"
                  required
                  className="peer appearance-none w-5 h-5 border-2 border-charcoal/40 bg-white rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <label htmlFor="age_18_confirmed" className="text-sm font-bold text-foreground leading-snug cursor-pointer">
                Confirmo bajo mi responsabilidad que tengo 18 años o más.
              </label>
            </div>
          </div>
        )}

        <SubmitButton mode={mode} />

      </form>
    </div>
  )
}

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus()

  if (mode === "signup") {
    return (
      <div className="pt-2">
        <button 
          type="submit"
          formAction={signup}
          disabled={pending}
          className="w-full h-12 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold text-base transition-colors shadow-md"
        >
          {pending ? "CREANDO CUENTA..." : "CREAR CUENTA NUEVA"}
        </button>
      </div>
    )
  }

  return (
    <div className="pt-2">
      <button 
        type="submit"
        formAction={login}
        disabled={pending}
        className="w-full h-12 bg-charcoal hover:bg-black disabled:bg-charcoal/50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-colors shadow-md"
      >
        {pending ? "INICIANDO SESIÓN..." : "VAMOS AL GRANO"}
      </button>
    </div>
  )
}
