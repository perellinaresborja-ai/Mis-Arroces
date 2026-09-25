"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { login, signup } from "./actions"
import { useFormStatus } from "react-dom"
import { checkDisplayNameAvailabilityAction, checkUsernameAvailabilityAction } from "@/app/onboarding/actions"

export function LoginForm({ initialMode = "login", initialEmail = "", error, message, redirectTo }: { initialMode?: "login" | "signup", initialEmail?: string, error?: string, message?: string, redirectTo?: string }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  useEffect(() => {
    if (initialMode) setMode(initialMode)
  }, [initialMode])
  const [showPassword, setShowPassword] = useState(false)
  const [acqData, setAcqData] = useState("")
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")

  // Identity fields for signup & real-time validation
  const [displayName, setDisplayName] = useState("")
  const [checkingDisplayName, setCheckingDisplayName] = useState(false)
  const [displayNameStatus, setDisplayNameStatus] = useState<{ available?: boolean; message?: string } | null>(null)

  const [username, setUsername] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; message?: string } | null>(null)

  const [legalAccepted, setLegalAccepted] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  // Real-time debounced check of displayName availability
  useEffect(() => {
    if (mode !== "signup") return
    const cleanDisplay = (displayName || "").trim()
    if (!cleanDisplay) {
      setDisplayNameStatus(null)
      return
    }

    if (cleanDisplay.length < 2) {
      setDisplayNameStatus({ available: false, message: "Mínimo 2 caracteres" })
      return
    }

    setCheckingDisplayName(true)
    const timer = setTimeout(async () => {
      try {
        const res = await checkDisplayNameAvailabilityAction(cleanDisplay)
        if (res.available) {
          setDisplayNameStatus({ available: true, message: "Nombre disponible" })
        } else {
          setDisplayNameStatus({ available: false, message: res.error || "Este nombre ya está en uso." })
        }
      } catch {
        setDisplayNameStatus(null)
      } finally {
        setCheckingDisplayName(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [displayName, mode])

  // Real-time debounced check of username availability
  useEffect(() => {
    if (mode !== "signup") return
    const cleanUser = (username || "").trim().toLowerCase().replace(/[^a-z0-9_.]/g, "")
    if (!cleanUser) {
      setUsernameStatus(null)
      return
    }

    if (cleanUser.length < 3) {
      setUsernameStatus({ available: false, message: "Mínimo 3 caracteres" })
      return
    }

    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailabilityAction(cleanUser)
        if (res.available) {
          setUsernameStatus({ available: true, message: "Nombre de usuario disponible" })
        } else {
          setUsernameStatus({ available: false, message: res.error || "Este nombre de usuario ya está en uso" })
        }
      } catch {
        setUsernameStatus(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, mode])

  const canSubmitSignup = 
    displayNameStatus?.available === true &&
    usernameStatus?.available === true &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    legalAccepted &&
    ageConfirmed &&
    !checkingDisplayName &&
    !checkingUsername

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

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
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="display_name" className="text-sm font-semibold text-charcoal block">
                  Nombre
                </label>
                <div className="relative flex items-center">
                  <input 
                    id="display_name" 
                    name="display_name" 
                    type="text" 
                    autoComplete="name" 
                    placeholder="Ej. Paco Arroces"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full h-12 pl-4 pr-10 bg-transparent border-2 rounded-xl outline-none transition-colors text-charcoal text-base ${
                      displayNameStatus?.available === false
                        ? "border-destructive focus:border-destructive"
                        : displayNameStatus?.available === true
                        ? "border-green-600 focus:border-green-600"
                        : "border-border/80 focus:border-charcoal"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {checkingDisplayName ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : displayNameStatus?.available === true ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : null}
                  </div>
                </div>
                {displayNameStatus?.message && (
                  <p className={`text-xs mt-1 font-medium ${
                    displayNameStatus.available === true ? "text-green-600" : "text-destructive"
                  }`}>
                    {displayNameStatus.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-semibold text-charcoal block">
                  Nombre de usuario
                </label>
                <div className="relative flex items-center">
                  <span className="h-12 flex items-center justify-center px-3.5 bg-muted/50 border-2 border-r-0 border-border/80 rounded-l-xl text-muted-foreground font-semibold text-sm">
                    @
                  </span>
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="paco_arroces"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    className={`w-full h-12 pl-3 pr-10 bg-transparent border-2 rounded-l-none rounded-r-xl outline-none transition-colors text-charcoal text-base font-medium ${
                      usernameStatus?.available === false
                        ? "border-destructive focus:border-destructive"
                        : usernameStatus?.available === true
                        ? "border-green-600 focus:border-green-600"
                        : "border-border/80 focus:border-charcoal"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {checkingUsername ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : usernameStatus?.available === true ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : null}
                  </div>
                </div>
                {usernameStatus?.message && (
                  <p className={`text-xs mt-1 font-medium ${
                    usernameStatus.available === true ? "text-green-600" : "text-destructive"
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>
            </>
          )}

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
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
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
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
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

        <SubmitButton mode={mode} canSubmitSignup={canSubmitSignup} />

      </form>
    </div>
  )
}

function SubmitButton({ mode, canSubmitSignup }: { mode: "login" | "signup", canSubmitSignup?: boolean }) {
  const { pending } = useFormStatus()

  if (mode === "signup") {
    return (
      <div className="pt-2">
        <button 
          type="submit"
          formAction={signup}
          disabled={pending || !canSubmitSignup}
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
