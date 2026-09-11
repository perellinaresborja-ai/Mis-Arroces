import { ImportedRecipe, ImportResult } from "../types"
import { parseRecipeTextWithAi } from "../structurer/ai-recipe-parser"

export class InstagramAdapter {
  async extract(url: string, shortcode: string | null): Promise<ImportResult> {
    try {
      if (!shortcode) {
        return {
          success: false,
          error: "No se ha podido identificar el enlace de la publicación o Reel de Instagram."
        }
      }

      const appId = process.env.META_APP_ID
      const clientToken = process.env.META_APP_SECRET || process.env.META_CLIENT_TOKEN

      // Official Meta oEmbed requires an app access token (app_id|client_token)
      if (!appId || !clientToken) {
        return {
          success: false,
          missingConfig: true,
          error: "La importación directa desde Instagram requiere configuración oficial de Meta API en el servidor."
        }
      }

      const accessToken = `${appId}|${clientToken}`
      const oembedUrl = `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(`https://www.instagram.com/p/${shortcode}/`)}&access_token=${accessToken}`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      let res: Response
      try {
        res = await fetch(oembedUrl, { signal: controller.signal })
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        return {
          success: false,
          error: "La publicación de Instagram no es pública o no está disponible."
        }
      }

      const data = await res.json()
      const rawCaption: string = data.title || ""
      const authorName: string = data.author_name || null

      if (!rawCaption.trim()) {
        return {
          success: false,
          isInsufficient: true,
          error: "Esta publicación de Instagram no tiene pie de foto con la receta."
        }
      }

      // Parse caption with AI structurer
      const parsed = await parseRecipeTextWithAi(rawCaption, `Receta de Instagram (@${authorName || "arrocero"})`)

      if (parsed.isInsufficient || !parsed.recipe || (parsed.recipe.ingredients.length === 0 && parsed.recipe.instructions.length === 0)) {
        return {
          success: false,
          isInsufficient: true,
          error: "El pie de foto de este Instagram no contiene una receta con ingredientes o pasos identificables."
        }
      }

      const recipeData = parsed.recipe
      const isComplete = recipeData.ingredients.length > 0 && recipeData.instructions.length > 0

      const recipe: ImportedRecipe = {
        source_platform: "INSTAGRAM",
        source_url: `https://www.instagram.com/p/${shortcode}/`,
        external_id: shortcode,
        title: recipeData.title || `Receta de @${authorName || "Instagram"}`,
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

      return {
        success: true,
        recipe
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Error al conectar con Instagram."
      }
    }
  }
}
