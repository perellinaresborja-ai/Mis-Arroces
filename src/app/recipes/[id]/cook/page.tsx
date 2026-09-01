import { BackButton } from "@/components/domain/BackButton"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CookForm } from "./CookForm"

export default async function CookRecipePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ servings?: string }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: recipe } = await supabase
    .from("recipes")
    .select(`
      id, name, rice_qty, stock_qty, variety_id, base_servings, cook_time,
      recipe_vessels(diameter_cm, vessel_type_id),
      rice_varieties(name)
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!recipe) notFound()

  // Calculate scaled values if servings override is provided
  const baseServings = recipe.base_servings || 1;
  const requestedServings = resolvedSearchParams.servings ? parseInt(resolvedSearchParams.servings, 10) : baseServings;
  const scaleRatio = !isNaN(requestedServings) && requestedServings > 0 ? requestedServings / baseServings : 1;

  // Build snapshot data
  const snapshotData = {
    rice_grams: recipe.rice_qty ? recipe.rice_qty * scaleRatio : null,
    liquid_ml: recipe.stock_qty ? recipe.stock_qty * scaleRatio : null,
    rice_variety_id: recipe.variety_id || null,
    variety_name: (recipe.rice_varieties as any)?.name || null,
    base_servings: requestedServings,
    cook_time: recipe.cook_time || null,
    diameter_cm: recipe.recipe_vessels?.[0]?.diameter_cm || null,
    vessel_type_id: recipe.recipe_vessels?.[0]?.vessel_type_id || null,
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24 md:pb-8">
      <div className="w-full max-w-lg space-y-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
        <header className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center relative"><div className="absolute left-0"><BackButton /></div><h1 className="text-2xl font-bold">Lo he cocinado</h1></div>
          <p className="text-muted-foreground">{recipe.name}</p>
        </header>

        <CookForm recipeId={recipe.id} snapshotData={snapshotData} />
      </div>
    </div>
  )
}
