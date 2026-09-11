import { ImportedRecipe, ImportResult } from "../types"
import { parseRecipeTextWithAi } from "../structurer/ai-recipe-parser"

export class TikTokAdapter {
  async extract(url: string, externalId: string | null): Promise<ImportResult> {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      let res: Response
      try {
        res = await fetch(oembedUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MisArroces/1.0"
          }
        })
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        if (res.status === 404 || res.status === 400) {
          return {
            success: false,
            error: "La publicación de TikTok no está disponible o es privada."
          }
        }
        return {
          success: false,
          error: `TikTok oEmbed respondió con estado ${res.status}.`
        }
      }

      const data = await res.json()
      const rawCaption: string = data.title || ""
      const authorName: string = data.author_name || null

      if (!rawCaption.trim()) {
        return {
          success: false,
          isInsufficient: true,
          error: "Este vídeo de TikTok no incluye pie de foto ni texto con la receta."
        }
      }

      // Structure caption with deterministic AI extractor
      const parsed = await parseRecipeTextWithAi(rawCaption, `Receta de ${authorName || "TikTok"}`)

      if (parsed.isInsufficient || !parsed.recipe || (parsed.recipe.ingredients.length === 0 && parsed.recipe.instructions.length === 0)) {
        return {
          success: false,
          isInsufficient: true,
          error: "El texto de este TikTok no contiene una receta con ingredientes o pasos identificables."
        }
      }

      const recipeData = parsed.recipe
      const isComplete = recipeData.ingredients.length > 0 && recipeData.instructions.length > 0

      const recipe: ImportedRecipe = {
        source_platform: "TIKTOK",
        source_url: url,
        external_id: externalId || data.embed_product_id || null,
        title: recipeData.title || `Receta de ${authorName || "TikTok"}`,
        description: rawCaption,
        author_name: authorName,
        servings: recipeData.servings ?? null,
        prep_time_minutes: recipeData.prep_time_minutes ?? null,
        cook_time_minutes: recipeData.cook_time_minutes ?? null,
        total_time_minutes: recipeData.total_time_minutes ?? null,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        raw_source_text: rawCaption,
        extraction_status: isComplete ? "COMPLETE" : "PARTIAL",
        warning_notes: []
      }

      if (!isComplete) {
        recipe.warning_notes?.push("Receta parcial: revisa los datos antes de publicar.")
      }

      return {
        success: true,
        recipe
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Error al conectar con TikTok."
      }
    }
  }
}
