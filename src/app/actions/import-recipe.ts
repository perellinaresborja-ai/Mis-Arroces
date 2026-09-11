"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { safeFetchHtml } from "@/lib/recipe-importer/ssrf"
import { extractRecipeFromJsonLd } from "@/lib/recipe-importer/extractor"
import { parseAndMatchIngredient } from "@/lib/recipe-importer/matcher"
import { getCatalogs } from "@/app/actions/recipes"

export interface ImportRecipeActionResult {
  success: boolean
  recipeId?: string
  error?: string
  existingDraftId?: string
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

  const cleanUrl = rawUrl?.trim()
  if (!cleanUrl) {
    return { success: false, error: "Por favor, introduce la URL de la receta." }
  }

  // 1. Check duplicate imports by the same user if not forced
  if (!forceNew) {
    try {
      const { data: existing } = await (supabase
        .from("recipes") as any)
        .select("id, name, status")
        .eq("owner_id", user.id)
        .eq("source_url", cleanUrl)
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
      // If column source_url does not exist yet, continue gracefully
    }
  }

  // 2. Fetch HTML securely with SSRF protections
  let html: string
  try {
    html = await safeFetchHtml(cleanUrl)
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con la web indicada." }
  }

  // 3. Extract Schema.org Recipe data
  let extracted: ReturnType<typeof extractRecipeFromJsonLd>
  try {
    extracted = extractRecipeFromJsonLd(html)
  } catch (err: any) {
    return { success: false, error: err.message || "No se ha encontrado ninguna receta compatible en esta página." }
  }

  // 4. Fetch catalogs for conservative ingredient matching
  const catalogs = await getCatalogs()

  // 5. Create DRAFT recipe in database
  const slug = `${extracted.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${Date.now()}`

  // Never invent technical data: only assign if extracted from source
  const recipeInsertPayload: any = {
    owner_id: user.id,
    name: extracted.name,
    slug,
    description: extracted.description || null,
    status: "DRAFT", // ALWAYS DRAFT, NEVER PUBLISHED
    source_url: cleanUrl,
    cook_time: extracted.cookTimeMinutes || extracted.totalTimeMinutes || null,
  }

  // Only assign base_servings if extracted from source; otherwise omit so DB uses default or user fills it in editor
  if (extracted.recipeYield !== null && extracted.recipeYield !== undefined) {
    recipeInsertPayload.base_servings = extracted.recipeYield
  }

  let newRecipe: any = null
  let { data: inserted, error: recipeError } = await supabase
    .from("recipes")
    .insert(recipeInsertPayload)
    .select("id")
    .single()

  if (recipeError && (recipeError.message?.includes("source_url") || recipeError.code === "PGRST204")) {
    // If source_url column has not been added yet via migration in remote DB, retry without source_url
    delete recipeInsertPayload.source_url
    const retry = await supabase
      .from("recipes")
      .insert(recipeInsertPayload)
      .select("id")
      .single()
    inserted = retry.data
    recipeError = retry.error
  }

  if (recipeError || !inserted) {
    console.error("Error creating draft recipe from import:", recipeError)
    return { success: false, error: "No se ha podido crear el borrador de la receta." }
  }
  newRecipe = inserted

  const recipeId = newRecipe.id

  // 6. Insert parsed ingredients
  if (extracted.ingredients && extracted.ingredients.length > 0) {
    const ingsToInsert = extracted.ingredients.map((rawIng, idx) => {
      const parsed = parseAndMatchIngredient(rawIng, catalogs)
      return {
        recipe_id: recipeId,
        display_order: idx + 1,
        display_text: parsed.displayText,
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

  // 7. Insert instructions / steps preserving sequence order
  if (extracted.instructions && extracted.instructions.length > 0) {
    const stepsToInsert = extracted.instructions.map((step, idx) => ({
      recipe_id: recipeId,
      step_number: idx + 1,
      instruction: step.instruction,
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
