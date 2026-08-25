// @ts-nocheck
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Pencil, Clock, Flame, Users, Beaker, ChefHat, Hourglass } from "lucide-react"
import { FeedCard } from "@/components/domain/FeedCard"
import { WantToCookButton } from "@/components/domain/WantToCookButton"
import { SaveRecipeButton } from "@/components/domain/SaveRecipeButton"

export default async function RecipeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch recipe with related data
  const { data: recipe } = await supabase
    .from("recipes")
    .select(`
      *,
      style:rice_styles(name),
      variety:rice_varieties(name),
      heat:heat_sources(name),
      media:recipe_media(media_assets(id, storage_path, is_deleted)),
      steps:recipe_steps(*, media:media_assets(storage_path)),
      ingredients:recipe_ingredients(
        *,
        unit:units(name),
        canonical:ingredients(normalized_name)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!recipe) redirect("/cookbook")

  // Check auth for edit button
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === recipe.owner_id

  // Get primary image
  const primaryMedia = recipe.media?.[0]?.media_assets?.storage_path
  const imageUrl = primaryMedia 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${primaryMedia}`
    : null

  // Calculate ratio
  const ratio = (recipe.rice_qty && recipe.stock_qty && recipe.rice_qty > 0)
    ? (recipe.stock_qty / recipe.rice_qty).toFixed(2)
    : null

  // Interactions Data
  let isLiked = false
  let likeCount = 0
  let isSaved = false
  let isWantToCook = false

  if (recipe.status === 'PUBLISHED') {
    if (user) {
      const [{ data: likeData }, { data: savedData }, { data: wantData }] = await Promise.all([
        supabase.from("recipe_likes").select("id").eq("recipe_id", recipe.id).eq("user_id", user.id).single(),
        supabase.from("collections").select("id, collection_recipes!inner(recipe_id)").eq("owner_id", user.id).eq("name", "Guardados").eq("collection_recipes.recipe_id", recipe.id).maybeSingle(),
        supabase.from("want_to_cook").select("id").eq("user_id", user.id).eq("recipe_id", recipe.id).single()
      ])
      isLiked = !!likeData
      isSaved = !!savedData
      isWantToCook = !!wantData
    }
    const { count } = await supabase.from("recipe_likes").select("id", { count: 'exact', head: true }).eq("recipe_id", recipe.id)
    likeCount = count || 0
  }

  // Fetch recent cooked sessions for this recipe
  const { data: sessions } = await supabase
    .from("cooking_sessions")
    .select(`
      *,
      author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      session_media(media:media_assets(id, storage_path))
    `)
    .eq("recipe_id", recipe.id)
    .eq("privacy_level", "PUBLIC")
    .order("date", { ascending: false })
    .limit(5)

  const mySessions = user ? (await supabase.from("cooking_sessions").select("*, session_media(media:media_assets(storage_path))").eq("recipe_id", recipe.id).eq("user_id", user.id).order("date", { ascending: false })).data || [] : []

  // Derived Values
  const totalDuration = (recipe.cook_time || 0) + (recipe.rest_time || 0)
  const vesselDetails = (recipe.recipe_vessels && recipe.recipe_vessels.length > 0) ? recipe.recipe_vessels[0] : null

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      
      <div className="max-w-6xl mx-auto pt-4 md:pt-10 px-4">
        
        {/* Top 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Image */}
          <div className="md:col-span-5">
            <div className="relative w-full aspect-square bg-muted rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-border">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-sand/30">
                  <span className="text-sm">Sin foto principal</span>
                </div>
              )}
              
              
            </div>
          </div>

          {/* Right Column: Title, Desc, Stats, Ficha */}
          <div className="md:col-span-7 flex flex-col">
            <div className="flex justify-between items-start gap-4">
              <div>
                
                <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">
                  {recipe.name}
                </h1>
              </div>
                
                
              {!isOwner && session?.user && (
                  <div className="shrink-0 flex gap-2">
                      <SaveRecipeButton recipeId={recipe.id} initialSaved={isSaved} />
                      <WantToCookButton recipeId={recipe.id} initialSaved={isWantToCook} />
                  </div>
                )}
            </div>

            {recipe.description && (
              <p className="mt-4 md:mt-6 text-muted-foreground text-[16px] leading-relaxed max-w-xl">
                {recipe.description}
              </p>
            )}

            {/* Elegant Stats Row */}
            <div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-8 py-5 border-y border-border">
              {recipe.base_servings && (
                <div className="flex items-center gap-3 text-foreground">
                  <Users className="w-5 h-5 text-muted-foreground/80" />
                  <span className="font-semibold text-[15px]">{recipe.base_servings} pax</span>
                </div>
              )}
              {recipe.style?.name && (
                <div className="flex items-center gap-3 text-foreground">
                  <ChefHat className="w-5 h-5 text-muted-foreground/80" />
                  <span className="font-semibold text-[15px]">{recipe.style.name}</span>
                </div>
              )}
              {recipe.heat?.name && (
                <div className="flex items-center gap-3 text-foreground">
                  <Flame className="w-5 h-5 text-muted-foreground/80" />
                  <span className="font-semibold text-[15px]">{recipe.heat.name.split('/')[0]}</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-3 text-foreground">
                  <Clock className="w-5 h-5 text-muted-foreground/80" />
                  <span className="font-semibold text-[15px]">{recipe.cook_time} min</span>
                </div>
              )}
              {recipe.rest_time && (
                <div className="flex items-center gap-3 text-foreground">
                  <Hourglass className="w-5 h-5 text-muted-foreground/80" />
                  <span className="font-semibold text-[15px]">{recipe.rest_time}m reposo</span>
                </div>
              )}
            </div>

            {/* Technical Data Card */}
            <div className="mt-8 bg-muted/30 rounded-2xl p-6 border border-border/50 max-w-xl">
              <h3 className="font-bold text-lg mb-4 text-charcoal font-serif">Ficha Técnica</h3>
              <ul className="space-y-3 text-sm">
                {recipe.variety && (
                  <li className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Variedad de arroz</span>
                    <span className="font-medium text-foreground">{recipe.variety.name}</span>
                  </li>
                )}
                {recipe.rice_qty && (
                  <li className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Cantidad de arroz</span>
                    <span className="font-medium text-foreground">{recipe.rice_qty}g</span>
                  </li>
                )}
                {recipe.stock_qty && (
                  <li className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Cantidad de caldo</span>
                    <span className="font-medium text-foreground">{recipe.stock_qty}ml</span>
                  </li>
                )}
                {ratio && (
                  <li className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Proporción</span>
                    <span className="font-medium text-foreground">1:{ratio}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Ingredients & Steps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mt-12 md:mt-20 pt-10 border-t border-border">
          
          {/* Ingredients */}
          <div className="md:col-span-5">
            <h2 className="text-2xl font-bold mb-6 font-serif text-charcoal">Ingredientes</h2>
            <ul className="space-y-4 max-w-[380px]">
                {recipe.ingredients?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => (
                  <li key={ing.id} className="flex justify-between items-baseline text-[15px] pb-2 border-b border-border/30 last:border-0">
                    <span className="text-foreground/90">{ing.display_text}</span>
                    {ing.normalized_quantity && (
                      <span className="font-bold text-charcoal shrink-0 ml-4">
                        {ing.normalized_quantity} {ing.unit?.name || ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
          </div>

          {/* Steps */}
          <div className="md:col-span-7">
            <h2 className="text-2xl font-bold mb-8 font-serif text-charcoal">Elaboración</h2>
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className="space-y-10">
                {recipe.steps.sort((a: any, b: any) => a.step_number - b.step_number).map((step: any) => {
                  const stepImageUrl = step.media?.storage_path 
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${step.media.storage_path}`
                    : null;

                  return (
                    <div key={step.id} className="relative pl-12 md:pl-16">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm font-serif shadow-sm">
                        {step.step_number}
                      </div>
                      <div className="absolute left-[15px] top-10 bottom-[-32px] w-px bg-border last:hidden" />
                      
                      <div className="pt-0.5 pb-2">
                        <p className="text-[17px] leading-relaxed text-foreground/90">{step.instruction}</p>
                        
                        {stepImageUrl && (
                          <div className="mt-5 mb-3 rounded-xl overflow-hidden border border-border/50 max-w-[300px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={stepImageUrl} alt={`Paso ${step.step_number}`} className="w-full h-auto object-cover" />
                          </div>
                        )}
                        
                        {step.duration_minutes && (
                          <div className="mt-4">
                            <span className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1.5 rounded-md">
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> {step.duration_minutes} min
                            </span>
                          </div>
                        )}
                        
                        {step.notes && (
                          <p className="text-sm text-muted-foreground mt-4 bg-muted/40 p-4 rounded-xl border border-border/30">
                            <span className="font-semibold text-charcoal">Nota: </span>{step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : isOwner ? (
              <Link href={`/recipes/${recipe.id}/edit`} className="text-sm text-primary hover:underline font-medium">
                + Añadir pasos de elaboración
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground italic">No se han añadido pasos todavía.</p>
            )}
          </div>
        </div>

        
          {/* Lo he cocinado CTA */}
          {!isOwner && user && (
            <div className="mt-16 bg-muted/30 border border-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1 font-serif text-charcoal">¿Te has animado a prepararlo?</h3>
                <p className="text-muted-foreground text-sm">Registra tu cocinado, sube tu foto y valora el socarrat.</p>
              </div>
              <Link href={`/recipes/${recipe.id}/cook`} className="shrink-0 w-full md:w-auto">
                <Button className="w-full md:w-auto font-bold rounded-xl h-12 px-8 bg-olive hover:bg-olive/90 text-white">
                  ¡Lo he cocinado!
                </Button>
              </Link>
            </div>
          )}

          {/* Community Sessions */}
        {sessions && sessions.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 font-serif text-charcoal">Lo han cocinado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s: any) => {
                const sMedia = s.session_media?.map((m: any) => m.media).filter(Boolean) || []
                return (
                  <FeedCard 
                    key={s.id} 
                    entityType="session" 
                    entityId={s.id} 
                    user={s.author} 
                    createdAt={s.date || s.created_at} 
                    isLiked={false} 
                    likeCount={0} 
                    commentCount={0} 
                    currentUserId={user?.id || null} 
                    sessionRating={s.rating} 
                    sessionSocarrat={s.socarrat_level} 
                    postContent={s.notes}
                    media={sMedia} 
                  />
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
