import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import Script from "next/script"
import { Flame } from "lucide-react"
import { fetchFeedPage } from "@/app/actions/feed"
import { FeedList } from "@/components/domain/FeedList"
import { StoriesBar } from "@/components/domain/StoriesBar"
import { fetchActiveStories } from "@/app/actions/stories"
import { HomeSessionGate } from "@/components/domain/HomeSessionGate"
import { HomeDeviceSignalGate } from "@/components/domain/HomeDeviceSignalGate"

export default async function Home() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // 1. Obtener usuario de la sesión activa
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Comprobar si este dispositivo tiene una cuenta asociada
  const allCookies = cookieStore.getAll()
  const hasAccountSignal =
    cookieStore.get("ma_has_account")?.value === "1" ||
    Boolean(cookieStore.get("ma_vault")?.value) ||
    allCookies.some(c => c.name.includes("auth-token") && c.value)

  // Si no hay usuario resuelto en el servidor pero el dispositivo tiene una cuenta activa o en conmutación,
  // NUNCA mostramos el feed público. Delegamos en HomeSessionGate que mantendrá el shell limpio
  // y cargará inmediatamente el contenido correspondiente una vez confirmada la sesión.
  if (!user && hasAccountSignal) {
    return <HomeSessionGate />
  }

  // 3. Cargar perfil (si está autenticado), feed e historias TODO EN PARALELO
  // Si user es null (y NO hay señal de cuenta), es un anónimo real -> carga directa del feed público.
  const [profileRes, feed, activeStories] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("id, onboarding_completed, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    fetchFeedPage(0, user),
    fetchActiveStories(user)
  ])

  const currentUserProfile = profileRes?.data || null

  if (user && currentUserProfile && !currentUserProfile.onboarding_completed) {
    const isNewUser = currentUserProfile.username?.startsWith("arrocero") && 
      (currentUserProfile.display_name === "Chef Arrocero" || currentUserProfile.display_name === currentUserProfile.username);
    if (!isNewUser) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    } else {
      const { redirect } = await import("next/navigation")
      redirect("/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      <HomeDeviceSignalGate isAnonymous={!user} />

      {/* Main Feed Content - Feed público para anónimos reales, feed personalizado para usuarios con sesión */}
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        
        {/* Stories Bar */}
        {(activeStories.length > 0 || user) && (
          <StoriesBar groupedStories={activeStories} currentUser={currentUserProfile || user} />
        )}

        {feed.length === 0 && (
          <div className="text-center p-12 bg-card rounded-3xl border border-border mt-8">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Tu muro está vacío</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Sigue a otros arroceros o sé el primero en publicar tu receta.
            </p>
            <Link href="/discover" className={buttonVariants({ variant: "outline", className: "rounded-xl" })}>
              Descubrir recetas
            </Link>
          </div>
        )}

        <FeedList initialItems={feed} currentUserId={user ? user.id : null} />

      </div>

      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "name": "misarroces",
                "alternateName": "misarroces.es",
                "url": "https://www.misarroces.es"
              },
              {
                "@type": "Organization",
                "name": "misarroces",
                "url": "https://www.misarroces.es",
                "logo": "https://www.misarroces.es/logopaellaicono.png",
                "description": "Plataforma y red social especializada en arroz, recetas y comunidad.",
                "slogan": "La red social de los arroces"
              }
            ]
          })
        }}
      />
    </div>
  )
}
