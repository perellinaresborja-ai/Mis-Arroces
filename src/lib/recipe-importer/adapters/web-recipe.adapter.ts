import { ImportedRecipe, ImportResult } from "../types"
import { safeFetchHtml } from "../ssrf"
import { extractRecipeFromJsonLd } from "../extractor"

export class WebRecipeAdapter {
  async extract(url: string): Promise<ImportResult> {
    try {
      const html = await safeFetchHtml(url)
      const extracted = extractRecipeFromJsonLd(html)

      const ingredients = extracted.ingredients.map(ing => ({
        raw_text: ing
      }))

      const instructions = extracted.instructions.map((step, idx) => ({
        step_number: idx + 1,
        text: step.instruction,
        notes: step.notes || null
      }))

      const isComplete = ingredients.length > 0 && instructions.length > 0
      const isInsufficient = ingredients.length === 0 && instructions.length === 0

      const recipe: ImportedRecipe = {
        source_platform: "WEB",
        source_url: url,
        external_id: null,
        title: extracted.name,
        description: extracted.description || null,
        author_name: null,
        servings: extracted.recipeYield ?? null,
        prep_time_minutes: extracted.prepTimeMinutes ?? null,
        cook_time_minutes: extracted.cookTimeMinutes ?? null,
        total_time_minutes: extracted.totalTimeMinutes ?? null,
        ingredients,
        instructions,
        raw_source_text: null,
        extraction_status: isComplete ? "COMPLETE" : (isInsufficient ? "UNSTRUCTURED" : "PARTIAL"),
        warning_notes: []
      }

      if (extracted.recipeYield === null) {
        recipe.warning_notes?.push("Raciones no especificadas en la fuente.")
      }

      return {
        success: !isInsufficient,
        recipe,
        isInsufficient,
        error: isInsufficient ? "No se han encontrado ingredientes ni pasos en esta página." : undefined
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "No se ha podido extraer la receta desde la web indicada."
      }
    }
  }
}
