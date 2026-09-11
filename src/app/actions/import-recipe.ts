"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { detectPlatformAndNormalizeUrl } from "@/lib/recipe-importer/detector"
import { fetchRecipeFromAnyUrl } from "@/lib/recipe-importer/registry"
import { parseAndMatchIngredient } from "@/lib/recipe-importer/matcher"
import { getCatalogs } from "@/app/actions/recipes"

export interface ImportRecipeActionResult {
  success: boolean
  recipeId?: string
  error?: string
  existingDraftId?: string
  isInsufficient?: boolean
}

export async function importRecipeFromUrlAction(
  rawUrl: string,
  forceNew: boolean = false
): Promise<ImportRecipeActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Debes iniciar sesión para importar recetas." }
  }

  const trimmed = rawUrl?.trim()
  if (!trimmed) {
    return { success: false, error: "Por favor, introduce la URL de la receta." }
  }

  // 1. Detect platform and canonicalize URL (strip tracking, canonicalize shorts, etc.)
  let detection: ReturnType<typeof detectPlatformAndNormalizeUrl>
  try {
    detection = detectPlatformAndNormalizeUrl(trimmed)
  } catch (err: any) {
    return { success: false, error: err.message || "Enlace no válido." }
  }

  const canonicalUrl = detection.normalizedUrl
  const platform = detection.platform

  // 2. Check duplicate imports by the same user if not forced
  if (!forceNew) {
    try {
      const { data: existing } = await (supabase
        .from("recipes") as any)
        .select("id, name, status")
        .eq("owner_id", user.id)
        .eq("source_url", canonicalUrl)
        .is("deleted_at", null)
        .maybeSingle()

      if (existing) {
        return {
          success: false,
          existingDraftId: existing.id,
          error: `Ya has importado esta receta anteriormente ("${existing.name}").`,
        }
      }
    } catch {
      // If error querying, continue gracefully
    }
  }

  // 3. Delegate to registered platform adapter
  const importResult = await fetchRecipeFromAnyUrl(canonicalUrl)

  if (!importResult.success || !importResult.recipe) {
    return {
      success: false,
      isInsufficient: importResult.isInsufficient,
      error: importResult.error || "No se ha podido procesar esta receta."
    }
  }

  const recipeData = importResult.recipe

  // 4. Fetch catalogs for conservative ingredient matching
  const catalogs = await getCatalogs()

  // 5. Generate clean slug
  const titleForSlug = recipeData.title || "receta-importada"
  const slug = `${titleForSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${Date.now()}`

  // 6. Create DRAFT recipe in database without hallucinating missing data
  const recipeInsertPayload: any = {
    owner_id: user.id,
    name: recipeData.title || "Receta Importada",
    slug,
    description: recipeData.description || null,
    status: "DRAFT", // ALWAYS DRAFT, NEVER PUBLISHED
    source_url: canonicalUrl,
    source_platform: platform,
    base_servings: recipeData.servings ?? null,
    cook_time: recipeData.cook_time_minutes || recipeData.total_time_minutes || null,
  }

  const { data: inserted, error: recipeError } = await supabase
    .from("recipes")
    .insert(recipeInsertPayload)
    .select("id")
    .single()

  if (recipeError || !inserted) {
    console.error("Error creating draft recipe from import:", recipeError)
    return { success: false, error: "No se ha podido crear el borrador de la receta." }
  }

  const recipeId = inserted.id

  // 7. Insert parsed ingredients preserving raw text
  if (recipeData.ingredients && recipeData.ingredients.length > 0) {
    const ingsToInsert = recipeData.ingredients.map((ing, idx) => {
      const parsed = parseAndMatchIngredient(ing.raw_text, catalogs)
      return {
        recipe_id: recipeId,
        display_order: idx + 1,
        display_text: parsed.displayText || ing.raw_text,
        normalized_quantity: parsed.normalizedQuantity,
        unit_id: parsed.unitId,
        canonical_ingredient_id: parsed.canonicalIngredientId,
        is_scalable: true,
      }
    })

    const { error: ingError } = await supabase.from("recipe_ingredients").insert(ingsToInsert)
    if (ingError) {
      console.error("Error inserting imported ingredients:", ingError)
    }
  }

  // 8. Insert instructions preserving sequence
  if (recipeData.instructions && recipeData.instructions.length > 0) {
    const stepsToInsert = recipeData.instructions.map((step, idx) => ({
      recipe_id: recipeId,
      step_number: step.step_number || idx + 1,
      instruction: step.text,
      duration_minutes: null, // Don't invent times per step
      notes: step.notes || null,
    }))

    const { error: stepError } = await supabase.from("recipe_steps").insert(stepsToInsert)
    if (stepError) {
      console.error("Error inserting imported steps:", stepError)
    }
  }

  revalidatePath("/cookbook")
  return {
    success: true,
    recipeId,
  }
}
