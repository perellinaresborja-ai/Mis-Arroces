const fs = require('fs');

let f = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// Inject the RPC fetch in homeData
const fetchReplacement = `
    let homeData = { popular: [] as any[], users: [] as any[], trending: [] as any[], most_cooked: [] as any[] }
    if (!q) {
      const { data: trendingIds } = await supabase.rpc("get_trending_recipes", { limit_val: 10 })
      if (trendingIds && trendingIds.length > 0) {
        const { data: trending } = await supabase.from("recipes").select(\`
          *,
          author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
          recipe_media(media:media_assets(id, storage_path))
        \`).in("id", trendingIds.map((t:any) => t.recipe_id))
        
        // Re-sort to match RPC order
        if (trending) {
          homeData.trending = trendingIds.map((t:any) => trending.find(r => r.id === t.recipe_id)).filter(Boolean)
        }
      }

      const { data: mostCookedIds } = await supabase.rpc("get_most_cooked_recipes", { time_filter: 'all_time', limit_val: 10 })
      if (mostCookedIds && mostCookedIds.length > 0) {
        const { data: mostCooked } = await supabase.from("recipes").select(\`
          *,
          author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
          recipe_media(media:media_assets(id, storage_path))
        \`).in("id", mostCookedIds.map((t:any) => t.recipe_id))
        
        if (mostCooked) {
          homeData.most_cooked = mostCookedIds.map((m:any) => ({
            ...mostCooked.find(r => r.id === m.recipe_id),
            cook_count: m.cook_count
          })).filter(r => r.id)
        }
      }

      // Existing popular fallback
`;
f = f.replace(/let homeData = \{ popular: \[\] as any\[\], users: \[\] as any\[\] \}\n\s*if \(\!q\) \{/, fetchReplacement);

// Render Tendencias
const tendenciasRender = `
        {/* DISCOVER HOME (No search active) */}
        {!q && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            
            {homeData.trending.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Tendencias ahora</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {homeData.trending.map((r) => {
                  const media = r.recipe_media?.[0]?.media?.storage_path
                  const imgUrl = media ? \`\${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/\${media}\` : null
                  return (
                    <Link key={r.id} href={\`/recipes/\${r.id}\`} className="snap-start shrink-0 w-64 group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors relative">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground/50">Sin foto</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base line-clamp-1 mb-1">{r.name}</h3>
                        <p className="text-xs text-muted-foreground">@{r.author?.username}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
            )}

            {homeData.most_cooked.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">🔥 Más cocinados</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {homeData.most_cooked.map((r) => {
                  const media = r.recipe_media?.[0]?.media?.storage_path
                  const imgUrl = media ? \`\${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/\${media}\` : null
                  return (
                    <Link key={r.id} href={\`/recipes/\${r.id}\`} className="snap-start shrink-0 w-64 group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors relative">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground/50">Sin foto</div>
                        )}
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full text-orange-600 border border-orange-500/20">
                          {r.cook_count} cocinados
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base line-clamp-1 mb-1">{r.name}</h3>
                        <p className="text-xs text-muted-foreground">@{r.author?.username}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
            )}
`;

f = f.replace(/\{\/\* DISCOVER HOME \(No search active\) \*\/\}\n\s*\{\!q && \(\n\s*<div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">/, tendenciasRender);

fs.writeFileSync('src/app/discover/page.tsx', f, 'utf8');
