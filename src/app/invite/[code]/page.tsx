import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { cookies } from "next/headers"
import { SetInviteCookie } from "./SetInviteCookie"

export default async function InviteLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params
  const { code } = resolvedParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Find inviter by code
  const { data: inviter } = await supabase.from("profiles").select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)").eq("invite_code", code).single()

  if (!inviter) {
    redirect("/") // Invalid code
  }

  // If already logged in
  if (user) {
    if (user.id === inviter.id) {
      redirect("/me") // Can't invite yourself
    }
    // They clicked an invite link but are already registered.
    const { data: follows } = await supabase.from("follows").select("status").eq("follower_id", user.id).eq("following_id", inviter.id).single()
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <SetInviteCookie code={code} />
        <div className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-sm text-center">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full overflow-hidden border-2 border-border mb-4">
            {inviter.avatar?.storage_path ? (
              <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${inviter.avatar.storage_path}`} alt={inviter.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-3xl font-bold">
                {inviter.display_name?.[0]?.toUpperCase() || inviter.username?.[0]?.toUpperCase() || "A"}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Hola de nuevo!</h1>
          <p className="text-muted-foreground mb-8">
            <span className="font-semibold text-foreground">@{inviter.username}</span> te ha invitado a seguirle en Mis Arroces.
          </p>
          
          <div className="space-y-3 flex flex-col">
            <Link href={`/@${inviter.username}`} className={buttonVariants({ className: "w-full font-bold rounded-xl", size: "lg" })}>
              Ver perfil
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full font-bold rounded-xl", size: "lg" })}>
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in -> Set cookie and show landing
  // Set cookie client-side to avoid Next.js Server Component cookie mutation error

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-sm text-center">
        <div className="relative w-48 h-12 mx-auto mb-8">
          <Image src="/logover.png" alt="Mis Arroces Logo" fill className="object-contain" priority />
        </div>

        <div className="w-24 h-24 mx-auto bg-muted rounded-full overflow-hidden border-2 border-border mb-4 relative z-10">
          {inviter.avatar?.storage_path ? (
            <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${inviter.avatar.storage_path}`} alt={inviter.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-3xl font-bold">
              {inviter.display_name?.[0]?.toUpperCase() || inviter.username?.[0]?.toUpperCase() || "A"}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">¡Estás invitado!</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          <strong className="text-foreground">@{inviter.username}</strong> te ha invitado a unirte a Mis Arroces.<br/><br/>
          Descubre, guarda y cocina las mejores recetas de arroz de la comunidad.
        </p>

        <div className="space-y-3 flex flex-col">
          <Link href="/login" className={buttonVariants({ className: "w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white", size: "lg" })}>
            Crear cuenta
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full font-bold rounded-xl", size: "lg" })}>
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
