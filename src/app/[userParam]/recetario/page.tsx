import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function PublicCookbookPage({ 
  params 
}: { 
  params: Promise<{ userParam: string }>
}) {
  const resolvedParams = await params
  const rawParam = decodeURIComponent(resolvedParams.userParam)
  const username = rawParam.startsWith("@") ? rawParam.substring(1) : rawParam

  const supabase = await createClient()

  // 1. Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()
  if (!profile) notFound()

  // 2. Fetch published recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*, recipe_media(display_order, media:media_assets(storage_path)), variety:rice_varieties(name), style:rice_styles(name)")
    .eq("owner_id", profile.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })

  const getMediaUrl = (mediaArray: any[]) => {
    const sorted = mediaArray ? [...mediaArray].sort((a,b) => (a.display_order||0) - (b.display_order||0)) : []
    const path = sorted[0]?.media?.storage_path
    return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${path}` : null
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <Link href={`/@${username}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver al perfil
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">
          Recetario de {profile.display_name || `@${username}`}
        </h1>
      </header>

      {recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {recipes.map((r: any) => {
            if (!r || !r.id) return null;
            const coverUrl = getMediaUrl(r.recipe_media)
            return (
              <Link 
                key={r.id} 
                href={`/recipes/${r.id}`}
                className="group block"
              >
                <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden mb-3 relative border border-border/50">
                  {coverUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={coverUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground font-medium text-sm">
                      Sin foto
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{r.name}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                  {r.style?.name && <span>{r.style.name}</span>}
                  {r.style?.name && r.variety?.name && <span>·</span>}
                  {r.variety?.name && <span>{r.variety.name}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 border border-border rounded-3xl bg-card">
          <h3 className="text-xl font-bold mb-2">Aún no hay arroces</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">Este usuario no ha publicado ninguna receta todavía.</p>
        </div>
      )}
    </div>
  )
}
