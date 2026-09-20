"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  completeOnboardingAction,
  updateOnboardingProfile,
  checkUsernameAvailabilityAction,
  checkDisplayNameAvailabilityAction,
  getSuggestedUsernameAction
} from "./actions"
import { Camera, Check, UserPlus, Loader2, Sparkles } from "lucide-react"
import { toggleFollow } from "@/app/actions/social"
import { acceptActiveLegalDocuments } from "@/app/actions/legal"
import Link from "next/link"

export function OnboardingWizard({ initialProfile, inviter, suggestions, inviteCode }: any) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Step 1 State
  const [username, setUsername] = useState(initialProfile?.username || "")
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; message?: string } | null>(null)
  const [checkingDisplayName, setCheckingDisplayName] = useState(false)
  const [displayNameStatus, setDisplayNameStatus] = useState<{ available?: boolean; message?: string } | null>(null)

  // Real-time debounced check of username availability
  useEffect(() => {
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
  }, [username])

  // Real-time debounced check of displayName availability
  useEffect(() => {
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
  }, [displayName])

  const handleSuggestUsername = async () => {
    try {
      setCheckingUsername(true)
      const res = await getSuggestedUsernameAction()
      if (res.suggestion) {
        setUsername(res.suggestion)
      }
    } catch {
      // ignore
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanUser = (username || "").trim().toLowerCase().replace(/[^a-z0-9_.]/g, "")
    if (!cleanUser) {
      setError("El nombre de usuario es obligatorio")
      return
    }
    if (cleanUser.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres")
      return
    }

    if (displayNameStatus?.available === false) {
      setError(displayNameStatus.message || "Este nombre ya está en uso.")
      return
    }
    
    setLoading(true)
    const res = await updateOnboardingProfile({ username: cleanUser, displayName })
    setLoading(false)
    
    if (res?.error) {
      setError(res.error)
      if (res.error.includes("nombre de usuario")) {
        setUsernameStatus({ available: false, message: res.error })
      } else {
        setDisplayNameStatus({ available: false, message: res.error })
      }
    } else {
      setStep(2)
    }
  }

  const handleFollow = async (userId: string) => {
    setError(null)
    const newFollowing = new Set(following)
    if (newFollowing.has(userId)) {
      newFollowing.delete(userId)
    } else {
      newFollowing.add(userId)
    }
    setFollowing(newFollowing)

    const res = await toggleFollow(userId, false, null) as any
    if (res?.error) {
      setError(res.error)
      const revert = new Set(following)
      setFollowing(revert)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    await completeOnboardingAction(inviteCode)
    router.refresh()
    router.push("/")
  }

  return (
    <div className="max-w-md mx-auto pt-12 p-4">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex gap-2">
          <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <div className="text-sm font-bold text-muted-foreground">Paso {step} de 3</div>
      </div>

      {error && (
        <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleProfileSubmit} className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold font-serif text-charcoal">Tu perfil</h1>
            <p className="text-muted-foreground text-sm">¿Cómo quieres que te conozcan los demás arroceros?</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Usuario</label>
                <button
                  type="button"
                  onClick={handleSuggestUsername}
                  disabled={checkingUsername || loading}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sugerir otro
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="h-12 flex items-center justify-center px-3 bg-muted border border-r-0 border-input rounded-l-xl text-muted-foreground font-medium text-sm">
                  @
                </span>
                <Input 
                  value={username} 
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} 
                  placeholder="usuario123"
                  className={`rounded-l-none rounded-r-xl h-12 pr-10 font-medium ${
                    usernameStatus?.available === false
                      ? "border-destructive focus-visible:ring-destructive"
                      : usernameStatus?.available === true
                      ? "border-green-600 focus-visible:ring-green-600"
                      : ""
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
                <p className={`text-xs mt-1.5 font-medium ${
                  usernameStatus.available === true ? "text-green-600" : "text-destructive"
                }`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Nombre (opcional)</label>
              <div className="relative flex items-center">
                <Input 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)} 
                  placeholder="Ej. Paco Arroces"
                  className={`rounded-xl h-12 pr-10 ${
                    displayNameStatus?.available === false
                      ? "border-destructive focus-visible:ring-destructive"
                      : displayNameStatus?.available === true
                      ? "border-green-600 focus-visible:ring-green-600"
                      : ""
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
                <p className={`text-xs mt-1.5 font-medium ${
                  displayNameStatus.available === true ? "text-green-600" : "text-destructive"
                }`}>
                  {displayNameStatus.message}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">Podrás añadir tu foto de perfil más adelante desde la configuración.</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold rounded-xl h-12 bg-olive hover:bg-olive/90 text-white">
            {loading ? "Guardando..." : "Siguiente"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold font-serif text-charcoal">Encuentra arroceros</h1>
            <p className="text-muted-foreground text-sm">Sigue a otros usuarios para descubrir sus elaboraciones en tu Inicio.</p>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto hide-scrollbar">
            {inviter && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Te invitó</p>
                <div className="flex items-center justify-between bg-primary/5 p-3 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                      {inviter.avatar?.storage_path ? (
                        <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${inviter.avatar.storage_path}`} alt={inviter.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-primary">{inviter.username[0].toUpperCase()}</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{inviter.display_name || inviter.username}</p>
                      <p className="text-xs text-muted-foreground">@{inviter.username}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={following.has(inviter.id) ? "secondary" : "default"}
                    onClick={() => handleFollow(inviter.id)}
                    className="rounded-xl font-bold text-xs"
                  >
                    {following.has(inviter.id) ? <Check className="w-3 h-3 mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                    {following.has(inviter.id) ? "Siguiendo" : "Seguir"}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Sugerencias para ti</p>
              {suggestions.length === 0 && <p className="text-sm text-muted-foreground">No hay sugerencias por ahora.</p>}
              <div className="space-y-3">
                {suggestions.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                        {user.avatar?.storage_path ? (
                          <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${user.avatar.storage_path}`} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/5">{user.username[0].toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{user.display_name || user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={following.has(user.id) ? "secondary" : "outline"}
                      onClick={() => handleFollow(user.id)}
                      className="rounded-xl font-bold text-xs"
                    >
                      {following.has(user.id) ? <Check className="w-3 h-3 mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                      {following.has(user.id) ? "Siguiendo" : "Seguir"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleComplete} disabled={loading} className="w-full font-bold rounded-xl h-12 bg-olive hover:bg-olive/90 text-white">
              {loading ? "Entrando..." : "Entrar a Mis Arroces"}
            </Button>
            <Button onClick={handleComplete} disabled={loading} variant="ghost" className="w-full font-bold rounded-xl text-muted-foreground">
              Ahora no
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
