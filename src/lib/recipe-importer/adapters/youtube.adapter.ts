import { ImportedRecipe, ImportResult } from "../types"
import { parseRecipeTextWithAi } from "../structurer/ai-recipe-parser"

export class YouTubeAdapter {
  async extract(url: string, videoId: string | null): Promise<ImportResult> {
    try {
      if (!videoId) {
        return {
          success: false,
          error: "No se ha podido identificar el ID del vídeo de YouTube."
        }
      }

      // 1. Fetch public metadata via official YouTube oEmbed
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      let res: Response
      try {
        res = await fetch(oembedUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MisArroces/1.0"
          }
        })
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        if (res.status === 404) {
          return {
            success: false,
            error: "El vídeo de YouTube no existe o es privado."
          }
        }
        return {
          success: false,
          error: `YouTube oEmbed respondió con estado ${res.status}.`
        }
      }

      const oembedData = await res.json()
      const title: string = oembedData.title || "Receta de YouTube"
      const authorName: string = oembedData.author_name || null

      // 2. Fetch full description if YOUTUBE_API_KEY is available server-side
      let fullDescription: string | null = null
      const youtubeApiKey = process.env.YOUTUBE_API_KEY

      if (youtubeApiKey) {
        try {
          const apiRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
          )
          if (apiRes.ok) {
            const apiJson = await apiRes.json()
            fullDescription = apiJson.items?.[0]?.snippet?.description || null
          }
        } catch (e) {
          console.error("YouTube API v3 fetch error:", e)
        }
      }

      // If no description could be obtained
      if (!fullDescription) {
        return {
          success: false,
          missingConfig: !youtubeApiKey,
          isInsufficient: true,
          error: youtubeApiKey
            ? "El vídeo no tiene descripción con la receta escrita."
            : "Para importar recetas de YouTube se requiere descripción escrita o configuración del servicio."
        }
      }

      // 3. Structure description text using AI parser
      const parsed = await parseRecipeTextWithAi(fullDescription, title)

      if (parsed.isInsufficient || !parsed.recipe || (parsed.recipe.ingredients.length === 0 && parsed.recipe.instructions.length === 0)) {
        return {
          success: false,
          isInsufficient: true,
          error: "La descripción del vídeo no contiene una receta con ingredientes o pasos identificables."
        }
      }

      const recipeData = parsed.recipe
      const isComplete = recipeData.ingredients.length > 0 && recipeData.instructions.length > 0

      const recipe: ImportedRecipe = {
        source_platform: "YOUTUBE",
        source_url: `https://www.youtube.com/watch?v=${videoId}`,
        external_id: videoId,
        title: recipeData.title || title,
        description: fullDescription,
        author_name: authorName,
        servings: recipeData.servings ?? null,
        prep_time_minutes: recipeData.prep_time_minutes ?? null,
        cook_time_minutes: recipeData.cook_time_minutes ?? null,
        total_time_minutes: recipeData.total_time_minutes ?? null,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        raw_source_text: fullDescription,
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
        error: err.message || "Error al conectar con YouTube."
      }
    }
  }
}
