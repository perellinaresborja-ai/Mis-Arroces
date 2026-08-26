// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { Flame, PlaySquare } from "lucide-react"
import { fetchFeedPage } from "@/app/actions/feed"
import { FeedList } from "@/components/domain/FeedList"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()
    if (!profile?.onboarding_completed) {
      const { redirect } = await import("next/navigation")
      redirect("/onboarding")
    }
  }

  const feed = await fetchFeedPage(0)

  const activeStories = await fetchActiveStories()

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      
      {/* Anonymous Welcome Header */}
      {!user && (
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-0 pt-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-12 text-center flex flex-col items-center shadow-sm">
            <div className="relative w-48 h-32 md:w-64 md:h-48 mb-4">
              <Image src="/mpng.png" alt="Mis Arroces Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Vamos al grano.</h1>
            <p className="text-muted-foreground max-w-md mb-6">Únete a la red social donde compartimos, medimos y perfeccionamos nuestros arroces.</p>
            <div className="flex gap-4">
              <Link href="/login" className={buttonVariants({ className: "rounded-xl font-bold" })}>Unirse / Entrar</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Feed Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        
        {/* Stories Bar */}
          <StoriesBar groupedStories={activeStories} currentUser={user} />

        {user && feed.length === 0 && (
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

        <FeedList initialItems={feed} currentUserId={user?.id || null} />

      </div>
    </div>
  )
}