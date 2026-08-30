// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { DiscoverClient } from "./DiscoverClient"
import { FeedCard } from "@/components/domain/FeedCard"
import { Users, BookOpen, Flame, LayoutTemplate, Search } from "lucide-react"

export default async function DiscoverPage(props: { searchParams?: Promise<{ q?: string, tab?: string, variety?: string, style?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ""
  const tab = searchParams?.tab || "todo"
  const variety = searchParams?.variety || ""
  const style = searchParams?.style || ""
  const hashtag = searchParams?.hashtag || ""

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch reference data for filters
  const [{ data: varieties }, { data: styles }] = await Promise.all([
    supabase.from("rice_varieties").select("*").order("name"),
    supabase.from("rice_styles").select("*").order("name")
  ])

  // Queries for results when searching
  let searchResults: { recipes: any[], users: any[], posts: any[], sessions: any[] } = {
    recipes: [], users: [], posts: [], sessions: []
  }

  
  if (hashtag) {
    // Get hashtag info
    const { data: htData } = await supabase.from("hashtags").select("id, name").eq("normalized_name", hashtag.toLowerCase()).single()
    
    if (htData) {
      // Get all entities with this hashtag
      const { data: entityTags } = await supabase.from("entity_hashtags").select("entity_type, entity_id").eq("hashtag_id", htData.id)
      
      if (entityTags && entityTags.length > 0) {
        const recipeIds = entityTags.filter(t => t.entity_type === 'recipe').map(t => t.entity_id)
        if (recipeIds.length > 0) {
          const { data } = await supabase.from("recipes").select(`
            *,
            author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
            recipe_media(display_order, media:media_assets(id, storage_path)),
            variety:rice_varieties(name),
            style:rice_styles(name)
          `).in("id", recipeIds).eq("status", "PUBLISHED").order("created_at", { ascending: false }).limit(20)
          
          if (data) searchResults.recipes = data
        }
      }
    }
  } else if (q || tab !== "todo") {
    const searchQ = q.startsWith("@") ? q.substring(1) : q

    if (tab === "todo" || tab === "arroces") {
      let req = supabase.from("recipes").select(`
        *,
        author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        recipe_media(display_order, media:media_assets(id, storage_path)),
        variety:rice_varieties(name),
        style:rice_styles(name)
      `).eq("status", "PUBLISHED").order("created_at", { ascending: false }).limit(20)
      if (q) req = req.ilike("name", `%${q}%`)
      
      if (variety) req = req.eq("variety_id", variety)
      if (style) req = req.eq("style_id", style)
      
      const { data } = await req
      if (data) searchResults.recipes = data
    }

    if (tab === "todo" || tab === "personas") {
      let reqProfiles = supabase.from("profiles").select(`
        id, username, display_name, account_type, professional_type, privacy_level, bio,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      `).limit(20)
      if (q) reqProfiles = reqProfiles.or(`username.ilike.%${searchQ}%,display_name.ilike.%${searchQ}%`)
      else reqProfiles = reqProfiles.eq("privacy_level", "PUBLIC")
      const { data } = await reqProfiles
      if (data) searchResults.users = data
    }

    if (tab === "todo" || tab === "publicaciones") {
      let req = supabase.from("social_posts").select(`
        *,
        author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        post_media(media:media_assets(id, storage_path)),
        recipe:recipes(id, name)
      `).eq("visibility", "PUBLIC").order("created_at", { ascending: false }).limit(20)
      if (q) req = req.ilike("content", `%${q}%`)
      
      const { data } = await req
      searchResults.posts = data || []
    }

    if (tab === "todo" || tab === "cocinados") {
      // Simplest: match recipe name or rating notes
      // Wait, we need to join recipes to search by recipe name!
      // In PostgREST, we can do filtering on joined tables: recipe:recipes!inner(name)
      let req = supabase.from("cooking_sessions").select(`
        *,
        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        session_media(media:media_assets(id, storage_path)),
        recipe:recipes!inner(id, name)
      `).in("privacy_level", ["PUBLIC", "FOLLOWERS"]).order("date", { ascending: false }).limit(20)
      if (q) req = req.ilike("recipe.name", `%${q}%`)
      const { data } = await req
      if (data) searchResults.sessions = data
    }
  }

  // Queries for Discover Home (when no search)
  let homeData = { popular: [] as any[], recent: [] as any[], users: [] as any[] }
  if (!q && tab === "todo") {
    const { data: popularRecipes, error: popError } = await supabase.from("popular_recipes_v1").select(`
      *,
      author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      recipe_media(media:media_assets(id, storage_path))
    `).order("popularity_score", { ascending: false }).limit(10)
    
    if (popError) {
      console.error("View error, falling back:", popError)
      const { data: fallback } = await supabase.from("recipes").select(`
        *,
        author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        recipe_media(media:media_assets(id, storage_path))
      `).eq("status", "PUBLISHED").order("created_at", { ascending: false }).limit(10)
      if (fallback) homeData.popular = fallback
    } else if (popularRecipes) {
      homeData.popular = popularRecipes
    }

    const { data: recentRecipes } = await supabase.from("recipes").select(`
        *,
        author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        recipe_media(media:media_assets(id, storage_path))
      `).eq("status", "PUBLISHED").order("created_at", { ascending: false }).limit(10)
      if (recentRecipes) homeData.recent = recentRecipes;

      const { data: users } = await supabase.from("profiles").select(`
      id, username, display_name, account_type, professional_type, privacy_level,
      avatar:media_assets!fk_profiles_avatar(storage_path)
    `).eq("privacy_level", "PUBLIC").limit(12) // random or recent, using limit for now
    
    if (users) homeData.users = users
  }

  // Helper to format avatar URL
  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return null
    return `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${avatarPath}`
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-24">
      
      {/* Search Header */}
      <DiscoverClient 
        initialQ={q} 
        initialTab={tab} 
        varieties={varieties || []} 
        styles={styles || []} 
      />

      {/* DISCOVER HOME (No search active) */}
      {(!q && tab === "todo") && (
        <div className="space-y-12 animate-in fade-in duration-500">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Arroceros que descubrir</h2>
              <Link href="/discover?tab=personas" className="text-sm font-semibold text-primary hover:underline">Ver todos &gt;</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {homeData.users.map((u) => {
                const avatar = getAvatarUrl(u.avatar?.storage_path)
                return (
                  <Link key={u.id} href={`/@${u.username}`} className="flex flex-col items-center gap-2 shrink-0 w-24 group">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-2 border-border overflow-hidden group-hover:border-primary transition-colors shadow-sm">
                      {avatar ? (
                        <img src={avatar} alt={u.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xl font-bold">
                          {u.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center truncate w-full px-1">{u.display_name}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Quick Chips Concept */}
          <section>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {['Seco', 'Caldoso', 'Al horno'].map(term => (
                <Link key={term} href={`/discover?q=${term}&tab=arroces`} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-primary/20 transition">
                  {term}
                </Link>
              ))}
              {['Pescado', 'Marisco', 'Carne', 'Verdura'].map(term => (
                <Link key={term} href={`/discover?q=${term}&tab=arroces`} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-secondary/80 transition">
                  {term}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Arroces populares</h2>
              <Link href="/discover?tab=arroces" className="text-sm font-semibold text-primary hover:underline">Ver todos &gt;</Link>
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-4 pb-4">
              {homeData.popular.map((r) => {
                const media = r.recipe_media?.[0]?.media?.storage_path
                const imgUrl = media ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${media}` : null
                return (
                  <Link key={r.id} href={`/recipes/${r.id}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="aspect-square bg-muted relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground/50">Sin foto</div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-bold text-sm line-clamp-1">{r.name}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1">@{r.author?.username}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Últimos arroces</h2>
              <Link href="/discover?tab=arroces" className="text-sm font-semibold text-primary hover:underline">Ver todos &gt;</Link>
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-4 pb-4">
              {homeData.recent.map((r) => {
                const media = r.recipe_media?.[0]?.media?.storage_path
                const imgUrl = media ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${media}` : null
                return (
                  <Link key={r.id} href={`/recipes/${r.id}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="aspect-square bg-muted relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground/50">Sin foto</div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-bold text-sm line-clamp-1">{r.name}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1">@{r.author?.username}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          

        </div>
      )}

      {/* SEARCH RESULTS */}
      {(q || tab !== "todo") && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Arroces Results */}
          {(tab === "todo" || tab === "arroces") && searchResults.recipes.length > 0 && (
            <section className="space-y-4">
              {tab === "todo" && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Arroces</h3>}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {searchResults.recipes.map((r) => {
                  const media = r.recipe_media?.[0]?.media?.storage_path
                  const imgUrl = media ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${media}` : null
                  return (
                    <Link key={r.id} href={`/recipes/${r.id}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                      <div className="aspect-square bg-muted relative">
                        {imgUrl ? (
                          <img src={imgUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><LayoutTemplate className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                        {(r.variety || r.style) && (
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {r.style && <span className="text-[10px] bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full font-semibold">{r.style.name}</span>}
                          </div>
                        )}
                      </div>
                      <div className="p-2 md:p-3">
                        <h3 className="font-bold text-sm line-clamp-1">{r.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">por {r.author?.display_name}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* People Results */}
          {(tab === "todo" || tab === "personas") && searchResults.users.length > 0 && (
            <section className="space-y-4">
              {tab === "todo" && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Personas</h3>}
              <div className="space-y-2">
                {searchResults.users.map((u) => {
                  const avatar = getAvatarUrl(u.avatar?.storage_path)
                  return (
                    <Link key={u.id} href={`/@${u.username}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                            {u.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate flex items-center gap-2">
                          {u.display_name} 
                          {u.professional_type === 'CHEF' && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase font-bold">Chef</span>}
                          {u.professional_type === 'RESTAURANT' && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase font-bold">Restaurante</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Posts Results */}
          {(tab === "todo" || tab === "publicaciones") && searchResults.posts.length > 0 && (
            <section className="space-y-4">
              {tab === "todo" && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Publicaciones</h3>}
              <div className="space-y-4">
                {searchResults.posts.map(p => {
                  const media = p.post_media?.map((m:any) => m.media).filter(Boolean) || []
                  return <FeedCard key={p.id} entityType="post" entityId={p.id} user={p.author} createdAt={p.created_at} isLiked={false} likeCount={0} commentCount={0} currentUserId={user?.id || null} postContent={p.content} linkedRecipe={p.recipe} media={media} />
                })}
              </div>
            </section>
          )}

          {/* Sessions Results */}
          {(tab === "todo" || tab === "cocinados") && searchResults.sessions.length > 0 && (
            <section className="space-y-4">
              {tab === "todo" && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cocinados</h3>}
              <div className="space-y-4">
                {searchResults.sessions.map(s => {
                  const media = s.session_media?.map((m:any) => m.media).filter(Boolean) || []
                  return <FeedCard key={s.id} entityType="session" entityId={s.id} user={s.author} createdAt={s.date || s.created_at} isLiked={false} likeCount={0} commentCount={0} currentUserId={user?.id || null} sessionRating={s.rating} sessionSocarrat={s.socarrat_level} linkedRecipe={s.recipe} media={media} />
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {Object.values(searchResults).every(arr => arr.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No se han encontrado resultados para "{q}".</p>
              <p className="text-sm mt-1">Prueba con otras palabras clave.</p>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
