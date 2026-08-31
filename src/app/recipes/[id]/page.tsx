// @ts-nocheck
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { formatUnitSymbol } from "@/lib/utils"
import { calculateNutrition } from "@/lib/nutrition"
import { NutritionSection } from "@/components/domain/NutritionSection"
import { Pencil, Clock, Flame, Users, Beaker, ChefHat, Hourglass } from "lucide-react"
import { FeedCard } from "@/components/domain/FeedCard"
import { WantToCookButton } from "@/components/domain/WantToCookButton"
import { SaveRecipeButton } from "@/components/domain/SaveRecipeButton"
import { AddToCartButton } from "@/components/domain/AddToCartButton"
import { LoHeCocinadoButton } from "@/components/domain/LoHeCocinadoButton"

import { ViewTracker } from "@/components/domain/ViewTracker"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: recipe } = await supabase.from("recipes").select("name, description, profiles(username), recipe_media(media:media_assets(storage_path))").eq("id", resolvedParams.id).single();
  
  if (!recipe) return {};

  const primaryMedia = (recipe.recipe_media?.[0] as any)?.media?.storage_path;
  const imageUrl = primaryMedia 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${primaryMedia}`
    : "/logopaellaicono.png";

  const authorName = (recipe.profiles as any)?.username || 'un chef arrocero';

  return {
    title: `${recipe.name} | Mis Arroces`,
    description: recipe.description || `Deliciosa receta de ${recipe.name} por @${authorName}. Descubre cómo prepararla paso a paso en Mis Arroces.`,
    openGraph: {
      title: `${recipe.name} | Mis Arroces`,
      description: recipe.description || `Aprende a preparar ${recipe.name} paso a paso.`,
      images: [imageUrl]
    },
    twitter: {
      card: "summary_large_image",
      title: `${recipe.name} | Mis Arroces`,
      description: recipe.description || `Aprende a preparar ${recipe.name} paso a paso.`,
      images: [imageUrl]
    }
  };
}

export default async function RecipeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch recipe with related data
  const { data: recipe, error } = await supabase
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
        unit:units(*),
        ingredient:ingredients(
          *,
          ingredient_allergens(allergens(*))
        ),
        canonical:ingredients(normalized_name)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (error) {
    console.error("Error fetching recipe in /recipes/[id]:", error);
  }

  if (!recipe) redirect("/cookbook")

  // Check auth for edit button
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === recipe.owner_id

  // Get primary image
  const primaryMedia = recipe.media?.[0]?.media_assets?.storage_path
  const imageUrl = primaryMedia 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${primaryMedia}`
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
  const { data: sessions, count: publicCookCount } = await supabase
    .from("cooking_sessions")
    .select(`
      *,
      author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      session_media(media:media_assets(id, storage_path))
    `)
    .eq("recipe_id", recipe.id)
    .eq("status", "PUBLISHED").eq("visibility", "PUBLIC")
    .order("date", { ascending: false })
    .limit(5)

  const mySessions = user ? (await supabase.from("cooking_sessions").select("*, session_media(media:media_assets(storage_path))").eq("recipe_id", recipe.id).eq("user_id", user.id).order("date", { ascending: false })).data || [] : []

  // Fetch all units for nutrition calculation
  const { data: unitsData } = await supabase.from("units").select("*");
  const nutrition = calculateNutrition(recipe.ingredients as any, unitsData || [], recipe.base_servings || 1);

  // Derived Values
  const totalDuration = (recipe.cook_time || 0) + (recipe.rest_time || 0)
  const vesselDetails = (recipe.recipe_vessels && recipe.recipe_vessels.length > 0) ? recipe.recipe_vessels[0] : null

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {recipe.owner_id && recipe.owner_id !== user?.id && <ViewTracker eventType="RECIPE_VIEW" entityType="RECIPE" entityId={recipe.id} ownerId={recipe.owner_id} />}
      
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
                
                
                  {(publicCookCount || 0) >= 5 && (
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-sm mb-3">
                      ✓ Probada por la comunidad
                    </div>
                  )}
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">

                  {recipe.name}
                </h1>
              </div>
              {isOwner && (
                <div className="shrink-0 flex gap-2">
                  <Link href={`/recipes/${recipe.id}/edit`} className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 transition-colors shadow-sm">
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Link>
                </div>
              )}
                
                
              {!isOwner && (
                  <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <SaveRecipeButton recipeId={recipe.id} initialSaved={isSaved} isAuthenticated={!!user} />
                      <WantToCookButton recipeId={recipe.id} initialSaved={isWantToCook} isAuthenticated={!!user} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-12 md:mt-20 pt-10 border-t border-border items-start">
          
          {/* Ingredients & Nutrition (Left Column in Desktop) */}
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 font-serif text-charcoal pl-2">Ingredientes</h2>
            <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-8 overflow-hidden shadow-sm">
              <ul className="space-y-1">
                  {[...(recipe.ingredients || [])].sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => (
                    <li key={ing.id} className="flex justify-between items-center text-[15px] py-3 border-b border-border/40 last:border-0">
                      <span className="text-foreground/90 pr-4">{ing.display_text}</span>
                      {ing.normalized_quantity && (
                        <span className="font-bold text-charcoal shrink-0 bg-muted/50 px-3 py-1.5 rounded-lg text-sm border border-border/50">
                          {ing.normalized_quantity} {formatUnitSymbol(ing.unit?.name)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <AddToCartButton recipeId={recipe.id} isAuthenticated={!!user} baseServings={recipe.base_servings} />
              
              <div className="mt-8 w-full">
                <NutritionSection result={nutrition} servings={recipe.base_servings || 1} />
              </div>
            </div>

            {/* Steps (Right Column in Desktop) */}
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 font-serif text-charcoal pl-2">Elaboración</h2>
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className="space-y-6">
                {[...recipe.steps].sort((a: any, b: any) => a.step_number - b.step_number).map((step: any) => {
                  const stepImageUrl = step.media?.storage_path 
                    ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${step.media.storage_path}`
                    : null;

                  return (
                    <div key={step.id} className="bg-card rounded-3xl border border-border p-5 md:p-7 overflow-hidden flex flex-col md:flex-row gap-5 md:gap-6 shadow-sm">
                      {/* Badge Paso */}
                      <div className="shrink-0 flex items-center md:items-start justify-between md:justify-start">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                          {step.step_number}
                        </div>
                        {/* En móvil la duración puede ir arriba a la derecha */}
                        <div className="md:hidden">
                          {step.duration_minutes && (
                            <span className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> {step.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1">
                        <p className="text-[16px] md:text-[17px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{step.instruction}</p>
                        
                        <div className="hidden md:flex flex-wrap gap-2 mt-4">
                          {step.duration_minutes && (
                            <span className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                              <Clock className="w-4 h-4 mr-1.5" /> {step.duration_minutes} min
                            </span>
                          )}
                        </div>
                        
                        {step.notes && (
                          <p className="text-sm text-muted-foreground mt-4 bg-muted/40 p-4 rounded-xl border border-border/50">
                            <span className="font-semibold text-charcoal">Nota: </span>{step.notes}
                          </p>
                        )}
                      </div>

                      {/* Imagen */}
                      {stepImageUrl && (
                        <div className="shrink-0 w-full md:w-32 lg:w-40 xl:w-48 mt-4 md:mt-0">
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                            <img src={stepImageUrl} alt={`Paso ${step.step_number}`} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
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
          {!isOwner && (
            <div className="mt-16 bg-muted/30 border border-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1 font-serif text-charcoal">¿Te has animado a prepararlo?</h3>
                <p className="text-muted-foreground text-sm">Registra tu cocinado, sube tu foto y valora el socarrat.</p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <LoHeCocinadoButton recipeId={recipe.id} isAuthenticated={!!user} />
              </div>
            </div>
          )}

          {/* Community Sessions */}
        {sessions && sessions.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 font-serif text-charcoal">Resultados de la comunidad</h2>
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
