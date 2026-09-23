import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { fetchFeedPage } from "@/app/actions/feed"
import { fetchActiveStories } from "@/app/actions/stories"
import { FeedList } from "@/components/domain/FeedList"
import { StoriesBar } from "@/components/domain/StoriesBar"
import { Flame } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default async function PublicFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si el usuario está autenticado, la portada ya muestra su feed personalizado.
  if (user) {
    redirect("/")
  }

  // Obtenemos el feed público y las historias
  const feed = await fetchFeedPage(0)
  const activeStories = await fetchActiveStories()

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      <div className="w-full bg-card border-b border-border py-4 px-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Estás viendo la versión pública de misarroces.</p>
        <Link href="/login" className={buttonVariants({ variant: "default", size: "sm", className: "rounded-full" })}>
          Inicia sesión para interactuar
        </Link>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        <StoriesBar groupedStories={activeStories} currentUser={null} />

        {feed.length === 0 && (
          <div className="text-center p-12 bg-card rounded-3xl border border-border mt-8">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">El muro está vacío</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Aún no hay publicaciones recientes.
            </p>
          </div>
        )}

        <FeedList initialItems={feed} currentUserId={null} />
      </div>
    </div>
  )
}
