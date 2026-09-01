import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CookModeClient } from "@/components/domain/cook-mode/CookModeClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modo Cocina - Mis Arroces",
  description: "Modo inmersivo paso a paso.",
}

export default async function RecipeCookModePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ servings?: string }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // No auth redirection needed strictly, anyone can cook a public recipe.
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(`
      id, name, rice_qty, stock_qty, base_servings,
      variety:rice_varieties(name),
      recipe_vessels(diameter_cm),
      steps:recipe_steps(*, media:media_assets(storage_path)),
      ingredients:recipe_ingredients(
        *,
        unit:units(name),
        canonical:ingredients(normalized_name)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const requestedServings = resolvedSearchParams.servings ? parseInt(resolvedSearchParams.servings, 10) : (recipe.base_servings || 1);
  const scaleRatio = !isNaN(requestedServings) && requestedServings > 0 ? requestedServings / (recipe.base_servings || 1) : 1;

  // Prepare recipe data for the client
  const clientRecipe = {
    id: recipe.id,
    name: recipe.name,
    base_servings: recipe.base_servings,
    requested_servings: requestedServings,
    scale_ratio: scaleRatio,
    rice_qty: recipe.rice_qty ? recipe.rice_qty * scaleRatio : null,
    stock_qty: recipe.stock_qty ? recipe.stock_qty * scaleRatio : null,
    variety_name: (recipe.variety as any)?.name || null,
    diameter_cm: recipe.recipe_vessels?.[0]?.diameter_cm || null,
    steps: [...(recipe.steps || [])].sort((a: any, b: any) => a.step_number - b.step_number),
  }

  return (
    <CookModeClient recipe={clientRecipe} />
  )
}
