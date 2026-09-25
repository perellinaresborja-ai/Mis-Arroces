"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { updateProfile } from "@/app/actions/profile"
import { checkDisplayNameAvailabilityAction, checkUsernameAvailabilityAction } from "@/app/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Check } from "lucide-react"

export function EditProfileForm({ initialProfile }: { initialProfile: any }) {
  const router = useRouter()
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [selectedCover, setSelectedCover] = useState<SelectedMedia[]>([])
  const [removeCover, setRemoveCover] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Real-time displayName check
  const [displayName, setDisplayName] = useState(initialProfile.display_name || "")
  const [checkingDisplayName, setCheckingDisplayName] = useState(false)
  const [displayNameStatus, setDisplayNameStatus] = useState<{ available?: boolean; message?: string } | null>(null)

  // Real-time username check
  const [username, setUsername] = useState(initialProfile.username || "")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; message?: string } | null>(null)

  useEffect(() => {
    const trimmed = (displayName || "").trim()
    if (!trimmed) {
      setDisplayNameStatus({ available: false, message: "El nombre es obligatorio." })
      return
    }

    if (trimmed === (initialProfile.display_name || "").trim()) {
      setDisplayNameStatus(null)
      return
    }

    if (trimmed.length < 2) {
      setDisplayNameStatus({ available: false, message: "Mínimo 2 caracteres." })
      return
    }

    setCheckingDisplayName(true)
    const timer = setTimeout(async () => {
      try {
        const res = await checkDisplayNameAvailabilityAction(trimmed)
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
  }, [displayName, initialProfile.display_name])

  useEffect(() => {
    const clean = (username || "").trim().toLowerCase().replace(/^@+/, "")
    if (!clean) {
      setUsernameStatus({ available: false, message: "El nombre de usuario es obligatorio." })
      return
    }

    if (clean === (initialProfile.username || "").trim().toLowerCase()) {
      setUsernameStatus(null)
      return
    }

    if (clean.length < 3) {
      setUsernameStatus({ available: false, message: "Mínimo 3 caracteres." })
      return
    }

    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailabilityAction(clean)
        if (res.available) {
          setUsernameStatus({ available: true, message: "Nombre de usuario disponible" })
        } else {
          setUsernameStatus({ available: false, message: res.error || "Este nombre de usuario ya está en uso." })
        }
      } catch {
        setUsernameStatus(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, initialProfile.username])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      if (selectedMedia.length > 0) {
        // Upload avatar
        const mediaId = await uploadMedia(selectedMedia[0].file, 'avatars', 'avatar') 
        formData.append("media_asset_id", mediaId)
      }

      if (removeCover) {
        formData.append("cover_media_id", "REMOVE")
      } else if (selectedCover.length > 0) {
        // Upload cover
        const coverId = await uploadMedia(selectedCover[0].file, 'avatars', 'cover')
        formData.append("cover_media_id", coverId)
      }

      const res = await updateProfile(formData)
      if (res?.success) {
        router.push(`/@${res.username}`)
        router.refresh()
        return
      }

      setIsSubmitting(false)
      setErrorMsg(res?.error || "Error al guardar el perfil.")
    } catch (err: any) {
      console.error("Fallo inesperado al guardar perfil:", err)
      setIsSubmitting(false)
      if (err?.digest?.startsWith?.("NEXT_REDIRECT") || err?.message === "NEXT_REDIRECT") {
        return
      }
      const msg = typeof err?.message === "string" && !err.message.includes("Minified React error")
        ? err.message
        : "Error al guardar el perfil. Comprueba los campos e inténtalo de nuevo."
      setErrorMsg(msg)
    }
  }

  const existingAvatarUrl = initialProfile.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${initialProfile.avatar.storage_path}`
    : null
    
  const existingCoverUrl = initialProfile.cover?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${initialProfile.cover.storage_path}`
    : null

  const displayAvatarUrl = selectedMedia.length > 0 ? selectedMedia[0].previewUrl : existingAvatarUrl
  const displayCoverUrl = removeCover ? null : (selectedCover.length > 0 ? selectedCover[0].previewUrl : existingCoverUrl)

  const hasCooldown = initialProfile.last_username_update 
    ? (new Date().getTime() - new Date(initialProfile.last_username_update).getTime()) / (1000 * 3600 * 24) < 30
    : false

  const isFormInvalid = 
    !displayName.trim() || 
    !username.trim() ||
    checkingDisplayName || 
    checkingUsername || 
    displayNameStatus?.available === false || 
    usernameStatus?.available === false ||
    (hasCooldown && username.trim().toLowerCase() !== (initialProfile.username || "").trim().toLowerCase())

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-3xl border border-border pb-12">
      
      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive font-medium text-sm rounded-xl border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {/* PORTADA & AVATAR COMBINED EDIT */}
      <div className="mb-8">
        {/* Cover */}
        <div className="w-full rounded-t-2xl overflow-hidden bg-muted relative border border-border group z-0" style={{ height: '250px' }}>
          {displayCoverUrl ? (
            <img src={displayCoverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-muted/50 to-muted-foreground/5" />
          )}
          
          <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 opacity-100">
            <div className="[&_button]:!text-white [&_button]:drop-shadow-md">
              <MediaUploader 
                context="avatars" 
                maxItems={1} 
                onMediaChange={(m) => {
                  setRemoveCover(false)
                  setSelectedCover(m)
                }} 
                className="w-auto"
                emptyLabel={displayCoverUrl ? "Cambiar portada" : "Añadir portada"}
                variant="text"
                hidePreview={true}
              />
            </div>
            {displayCoverUrl && (
              <Button type="button" variant="destructive" size="sm" onClick={() => setRemoveCover(true)} className="h-8">
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Avatar overlapping */}
        <div className="flex flex-col items-center -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card bg-muted shadow-sm">
            {displayAvatarUrl ? (
               <img src={displayAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : null}
          </div>
          
          <div className="mt-2 flex justify-center">
            <MediaUploader 
              context="avatars" 
              maxItems={1} 
              onMediaChange={setSelectedMedia} 
              className="w-full text-center"
              emptyLabel={displayAvatarUrl ? "Cambiar foto" : "Subir foto"}
              variant="text"
              hidePreview={true}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4  border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="display_name">Nombre</Label>
          <div className="relative flex items-center">
            <Input 
              id="display_name" 
              name="display_name" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              required
              placeholder="Ej. Pere"
              className={`h-12 pr-10 ${
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

        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario</Label>
          <div className="relative flex items-center">
            <span className="h-12 flex items-center justify-center px-3 bg-muted border border-r-0 border-input rounded-l-xl text-muted-foreground font-medium">@</span>
            <Input 
              id="username" 
              name="username" 
              value={username} 
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              required 
              placeholder="pere"
              pattern="^[a-z0-9_.]{3,30}$"
              title="Solo minúsculas, números, guiones bajos y puntos."
              className={`h-12 rounded-l-none pr-10 ${
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
          <p className="text-xs text-muted-foreground">Tu identidad en misarroces. Único y sin espacios.</p>
          {hasCooldown && (
            <p className="text-xs text-destructive">Has cambiado tu usuario recientemente. Faltan días para volver a cambiarlo.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Algo sobre mí</Label>
          <textarea 
            id="bio" 
            name="bio" 
            defaultValue={initialProfile.bio || ""} 
            maxLength={150}
            placeholder="Arroces, fuego y sarmiento." 
            className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Sitio web, blog o enlace</Label>
          <Input 
            id="website" 
            name="website" 
            type="url"
            defaultValue={initialProfile.website || ""} 
            placeholder="https://ejemplo.com" 
            className="h-12 rounded-xl border-input"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="privacy_level">Privacidad</Label>
          <select 
            id="privacy_level" 
            name="privacy_level" 
            defaultValue={initialProfile.privacy_level}
            className="w-full h-12 px-3 rounded-xl border border-input bg-background"
          >
            <option value="PUBLIC">Pública (Cualquiera puede seguirte y ver tus arroces)</option>
            <option value="PRIVATE">Privada (Tú apruebas quién te sigue)</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full h-14 rounded-xl text-lg" disabled={isSubmitting || isFormInvalid}>
          {isSubmitting ? "Guardando..." : <><Save className="w-5 h-5 mr-2" /> Guardar Perfil</>}
        </Button>
      </div>

    </form>
  )
}
