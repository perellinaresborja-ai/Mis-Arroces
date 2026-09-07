import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CookModeClient } from "@/components/domain/cook-mode/CookModeClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modo Cocina - Mis Arroces",
  description: "Modo inmersivo paso a paso.",
}

export default async function RecipeCookModePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ servings?: string, reset?: string }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // No auth redirection needed strictly, anyone can cook a public recipe.
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(`
      id, name, rice_qty, stock_qty, base_servings, rest_time,
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
  const isReset = resolvedSearchParams.reset === "true";

  let userName = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('display_name, username').eq('id', user.id).single();
    if (profile) {
      userName = profile.display_name || profile.username;
    }
  }

  const sortedSteps = [...(recipe.steps || [])].sort((a: any, b: any) => a.step_number - b.step_number);
  
  const hasExplicitRestStep = sortedSteps.some(step => 
    step.instruction.toLowerCase().includes('repos') || 
    (step.notes && step.notes.toLowerCase().includes('repos'))
  );

  if (recipe.rest_time && recipe.rest_time > 0 && !hasExplicitRestStep) {
    sortedSteps.push({
      id: "virtual-rest-step",
      recipe_id: recipe.id,
      step_number: sortedSteps.length > 0 ? sortedSteps[sortedSteps.length - 1].step_number + 1 : 1,
      instruction: "Deja reposar el arroz",
      notes: "El reposo es fundamental para que el arroz asiente y absorba los últimos sabores.",
      duration_minutes: recipe.rest_time,
      media: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media_id: null
    });
  }

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
    steps: sortedSteps,
  }

  return (
    <CookModeClient recipe={clientRecipe} userName={userName} reset={isReset} />
  )
}
