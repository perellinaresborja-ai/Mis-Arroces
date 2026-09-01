import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CookbookRecipeCard } from "@/components/domain/CookbookRecipeCard"

export default async function CookbookPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const tab = searchParams?.tab || "mine"
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let recipes: any[] = []
  let sessions: any[] = []

  if (tab === "mine") {
    const { data } = await supabase.from("recipes").select("*, recipe_media!recipe_media_recipe_id_fkey(display_order, media:media_assets(storage_path)), variety:rice_varieties(name), style:rice_styles(name), likes:recipe_likes(user_id), comments:recipe_comments(id)").eq("owner_id", user.id).order("created_at", { ascending: false })
    
    const rawData = data || []
    recipes = rawData.filter((r: any) => {
      const isEmptyDraft = r.status === 'DRAFT' && r.name === 'Nueva Receta' && (!r.recipe_media || r.recipe_media.length === 0)
      return !isEmptyDraft
    })

  } else if (tab === "saved") {
    const { data } = await supabase.from("saves").select("recipes(*, recipe_media!recipe_media_recipe_id_fkey(display_order, media:media_assets(storage_path)), variety:rice_varieties(name), style:rice_styles(name), author:profiles!recipes_owner_id_fkey(username))").eq("user_id", user.id).order("saved_at", { ascending: false })
    recipes = data?.map(d => d.recipes).filter(Boolean) || []
  } else if (tab === "want") {
    const { data } = await supabase.from("want_to_cook").select("recipes(*, recipe_media!recipe_media_recipe_id_fkey(display_order, media:media_assets(storage_path)), variety:rice_varieties(name), style:rice_styles(name), author:profiles!recipes_owner_id_fkey(username))").eq("user_id", user.id).order("added_at", { ascending: false })
    recipes = data?.map(d => d.recipes).filter(Boolean) || []
  } else if (tab === "cooked") {
    const { data } = await supabase.from("cooking_sessions").select("*, session_media(display_order, media:media_assets(storage_path)), recipe:recipes(id, name)").eq("user_id", user.id).order("created_at", { ascending: false })
    sessions = data || []
  }

  const getMediaUrl = (mediaArray: any[]) => {
    const sorted = mediaArray ? [...mediaArray].sort((a,b) => (a.display_order||0) - (b.display_order||0)) : []
    const path = sorted[0]?.media?.storage_path
    return path ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${path}` : null
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pt-4 md:pt-0 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Mi Recetario</h1>
        </div>
        <div>
          <Link href="/create/recipe">
            <Button className="h-10 px-6 w-full md:w-auto font-bold rounded-full">
              <Plus className="w-5 h-5 mr-1" /> Nueva receta
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
        <Link 
          href="?tab=cooked" 
          className={`pb-3 font-medium transition-colors whitespace-nowrap border-b-2 ${tab === 'cooked' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Mis Arroces
        </Link>
        <Link 
          href="?tab=mine" 
          className={`pb-3 font-medium transition-colors whitespace-nowrap border-b-2 ${tab === 'mine' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Mis recetas
        </Link>
        <Link 
          href="?tab=saved" 
          className={`pb-3 font-medium transition-colors whitespace-nowrap border-b-2 ${tab === 'saved' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Guardados
        </Link>
        <Link 
          href="?tab=want" 
          className={`pb-3 font-medium transition-colors whitespace-nowrap border-b-2 ${tab === 'want' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Quiero cocinar
        </Link>
      </div>

      {tab === 'cooked' ? (
        sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full">
            {sessions.map((s: any) => {
              if (!s || !s.id) return null;
              // A simple card for now, or you could reuse ProfileGridCard if it's imported
              const bgImg = getMediaUrl(s.session_media)
              return (
                <Link key={s.id} href={`/sessions/${s.id}`} className="block relative overflow-hidden rounded-2xl aspect-[4/5] bg-card border border-border group">
                  {bgImg ? (
                    <img src={bgImg} alt="Session" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground font-bold">Sin foto</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-lg leading-tight drop-shadow-md">{s.recipe?.name || 'Arroz'}</p>
                    <p className="text-white/80 text-sm font-medium mt-1">{new Date(s.date).toLocaleDateString()}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <p className="text-muted-foreground text-lg font-medium">TodavÃ­a no has registrado ningÃºn arroz.</p>
            <Link href="/discover">
              <Button variant="outline" className="mt-4 rounded-xl font-bold">Descubrir arroces</Button>
            </Link>
          </div>
        )
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full">
          {recipes.map((r: any) => {
            if (!r || !r.id) return null;
            return <CookbookRecipeCard key={r.id} recipe={r} tab={tab} />
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4">
          <p className="text-muted-foreground text-lg font-medium">
            {tab === "mine" ? "TodavÃ­a no tienes recetas propias." : (tab === "saved" ? "No tienes arroces guardados." : "Busca un arroz que te apetezca y mÃ¡rcalo para cocinarlo.")}
          </p>
          <Link href={tab === "mine" ? "/create/recipe" : "/discover"}>
            <Button variant="outline" className="mt-4 rounded-xl font-bold">
              {tab === "mine" ? "+ Nueva receta" : "Descubrir arroces"}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}