import { NotificationBell } from "@/components/domain/NotificationBell";
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import Script from "next/script"
import { Flame, PlaySquare } from "lucide-react"
import { fetchFeedPage } from "@/app/actions/feed"
import { FeedList } from "@/components/domain/FeedList"
import { StoriesBar } from "@/components/domain/StoriesBar"
import { fetchActiveStories } from "@/app/actions/stories"
import { LandingContent } from "@/components/domain/LandingContent"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  

  let currentUserProfile: any = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .eq("id", user.id)
      .single()

    currentUserProfile = profile;

    if (!profile?.onboarding_completed) {
      // Check if it's a new user who hasn't completed onboarding
      const isNewUser = profile?.username?.startsWith("arrocero") && (profile?.display_name === "Chef Arrocero" || profile?.display_name === profile?.username);
      if (!isNewUser) {
        // Auto-complete onboarding for existing legacy users
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      } else {
        const { redirect } = await import("next/navigation")
        redirect("/onboarding")
      }
    }
  }

  // Only fetch feed and stories if user is authenticated
  const feed = user ? await fetchFeedPage(0) : []
  const activeStories = user ? await fetchActiveStories() : []

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      {/* Anonymous Welcome Header */}
      {!user && (
        <LandingContent isHome={true} />
      )}

      {/* Main Feed Content - ONLY IF AUTHENTICATED */}
      {user && (
        <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
          
          {/* Stories Bar */}
          <StoriesBar groupedStories={activeStories} currentUser={currentUserProfile || user} />

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

          <FeedList initialItems={feed} currentUserId={user.id} />

        </div>
      )}
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



