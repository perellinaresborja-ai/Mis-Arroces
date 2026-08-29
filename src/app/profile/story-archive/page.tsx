import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ArchiveGrid } from "./ArchiveGrid"

export default async function StoryArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch expired or archived stories for this user
  const { data: stories } = await supabase
    .from("stories")
    .select("*, author:profiles!stories_owner_id_fkey(*), story_media(*)")
    .eq("owner_id", user.id)
    .lte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background pb-safe">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/me" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bold text-lg font-serif">Archivo de Historias</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="p-4">
        {(!stories || stories.length === 0) ? (
          <div className="text-center text-muted-foreground py-12">
            No tienes historias archivadas.
          </div>
        ) : (
          <ArchiveGrid stories={stories} />
        )}
      </div>
    </div>
  )
}
