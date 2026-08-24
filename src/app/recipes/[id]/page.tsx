import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Pencil, Clock, Flame, Users, Beaker, CheckCircle2 } from "lucide-react"

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
      media:recipe_media(media_assets(storage_path, is_deleted)),
      steps:recipe_steps(*),
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image Section */}
      <div className="relative w-full h-80 bg-muted">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-sand">
            Sin foto principal
          </div>
        )}
        
        {isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <Link href={`/recipes/${recipe.id}/edit`}>
              <Button size="icon" className="rounded-full shadow-lg bg-background/80 text-foreground hover:bg-background backdrop-blur-sm">
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Gradient Overlay for Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 p-4 w-full text-cream">
          <div className="flex gap-2 mb-2">
            {recipe.style?.name && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/90 rounded-md">
                {recipe.style.name}
              </span>
            )}
            {recipe.status === "DRAFT" && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-destructive/90 rounded-md">
                Borrador
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{recipe.name}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-8">
        
        {recipe.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border border-border">
            <Users className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs font-semibold">{recipe.base_servings || "-"}</span>
            <span className="text-[10px] text-muted-foreground text-center">Pax</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border border-border">
            <Clock className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs font-semibold">{recipe.cook_time || "-"}</span>
            <span className="text-[10px] text-muted-foreground text-center">Min cocción</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border border-border">
            <Flame className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs font-semibold">{recipe.heat?.name?.split('/')[0] || "-"}</span>
            <span className="text-[10px] text-muted-foreground text-center">Fuego</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border border-border">
            <Beaker className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs font-semibold">{ratio ? `1:${ratio}` : "-"}</span>
            <span className="text-[10px] text-muted-foreground text-center">Ratio</span>
          </div>
        </div>

        {/* Technical Data */}
        <section>
          <h3 className="font-bold text-lg mb-3">Técnica</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Variedad de arroz</span>
              <span className="font-medium">{recipe.variety?.name || "No especificada"}</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Cantidad de arroz</span>
              <span className="font-medium">{recipe.rice_qty ? `${recipe.rice_qty}g` : "-"}</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Cantidad de caldo</span>
              <span className="font-medium">{recipe.stock_qty ? `${recipe.stock_qty}ml` : "-"}</span>
            </li>
            <li className="flex justify-between pb-2">
              <span className="text-muted-foreground">Tiempo de reposo</span>
              <span className="font-medium">{recipe.rest_time ? `${recipe.rest_time} min` : "-"}</span>
            </li>
          </ul>
        </section>

        {/* Steps */}
        <section>
          <h3 className="font-bold text-lg mb-4">Elaboración</h3>
          {recipe.steps && recipe.steps.length > 0 ? (
            <div className="space-y-4">
              {recipe.steps.sort((a: any, b: any) => a.step_number - b.step_number).map((step: any) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {step.step_number}
                    </div>
                    <div className="w-px h-full bg-border mt-2" />
                  </div>
                  <div className="pt-1 pb-4">
                    <p className="text-sm leading-relaxed">{step.instruction}</p>
                    {step.duration_minutes && (
                      <span className="inline-flex items-center text-xs text-primary font-medium mt-2 bg-primary/10 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3 mr-1" /> {step.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No se han añadido pasos todavía.</p>
          )}
        </section>
      </div>
    </div>
  )
}
