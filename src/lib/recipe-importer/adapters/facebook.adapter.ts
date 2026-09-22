import { ImportedRecipe, ImportResult } from "../types"
import { parseRecipeTextWithAi } from "../structurer/ai-recipe-parser"

export class FacebookAdapter {
  async extract(url: string, externalId: string | null): Promise<ImportResult> {
    // TEMPORALMENTE DESHABILITADO POR RESTRICCIONES DE META
    return {
      success: false,
      error: "La importación desde Facebook está temporalmente deshabilitada por restricciones de la plataforma."
    }

    try {
      const apifyToken = process.env.APIFY_API_TOKEN

      if (!apifyToken) {
        return {
          success: false,
          missingConfig: true,
          error: "La importación desde Facebook requiere configurar APIFY_API_TOKEN en el servidor."
        }
      }

      // 1. Iniciar Actor de forma asíncrona (POST /runs)
      const apifyUrl = `https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs?token=${apifyToken}`
      const res = await fetch(apifyUrl, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startUrls: [{ url }], resultsLimit: 1 })
      })

      if (!res.ok) {
        return { success: false, error: "Error al iniciar la extracción en Facebook." }
      }

      const data = await res.json()
      if (!data.data || !data.data.id) {
        return { success: false, error: "No se pudo obtener el ID del proceso de Facebook." }
      }

      // Devolver inmediatamente para no bloquear el request HTTP
      return { success: true, isAsync: true, runId: data.data.id }
    } catch (err: any) {
      return { success: false, error: err.message || "Error al conectar con Facebook." }
    }
  }

  async checkStatus(runId: string): Promise<ImportResult & { pending?: boolean }> {
    try {
      const apifyToken = process.env.APIFY_API_TOKEN
      if (!apifyToken) return { success: false, error: "Falta APIFY_API_TOKEN." }

      const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      const res = await fetch(statusUrl, { cache: 'no-store' })
      if (!res.ok) return { success: false, error: "Error al consultar estado a Apify." }

      const data = await res.json()
      const status = data.data.status

      if (status === 'READY' || status === 'RUNNING') {
        return { success: true, pending: true }
      }

      if (status === 'FAILED' || status === 'ABORTING' || status === 'ABORTED' || status === 'TIMING-OUT' || status === 'TIMED-OUT') {
        return { success: false, error: `La extracción en Facebook falló (Estado: ${status}).` }
      }

      if (status === 'SUCCEEDED') {
        const datasetId = data.data.defaultDatasetId
        const dsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
        const dsRes = await fetch(dsUrl, { cache: 'no-store' })
        const items = await dsRes.json()

        if (!Array.isArray(items) || items.length === 0) {
          return { success: false, error: "No se encontró información. ¿Es posible que la publicación sea privada o eliminada?" }
        }

        const post = items[0]
        if (post.error) {
          return { success: false, error: post.errorDescription || "Publicación no accesible o privada." }
        }

        const rawText: string = post.text || post.message || post.description || post.caption || ""
        const authorName: string = (post.user && post.user.name) ? post.user.name : (post.author || "Facebook")

        if (!rawText.trim()) {
          return { success: false, isInsufficient: true, error: "Esta publicación de Facebook no tiene texto del que extraer." }
        }

        const parsed = await parseRecipeTextWithAi(rawText, `Receta de Facebook (@${authorName})`)

        if (parsed.isInsufficient || !parsed.recipe || (parsed.recipe.ingredients.length === 0 && parsed.recipe.instructions.length === 0)) {
          return { success: false, isInsufficient: true, error: "El texto de esta publicación no contiene una receta con ingredientes identificables." }
        }

        const recipeData = parsed.recipe
        const isComplete = recipeData.ingredients.length > 0 && recipeData.instructions.length > 0

        const recipe: ImportedRecipe = {
          source_platform: "FACEBOOK",
          source_url: post.url || "https://www.facebook.com",
          external_id: null,
          title: recipeData.title || `Receta de @${authorName}`,
          description: rawText,
          author_name: authorName,
          servings: recipeData.servings ?? null,
          prep_time_minutes: recipeData.prep_time_minutes ?? null,
          cook_time_minutes: recipeData.cook_time_minutes ?? null,
          total_time_minutes: recipeData.total_time_minutes ?? null,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          raw_source_text: rawText,
          extraction_status: isComplete ? "COMPLETE" : "PARTIAL",
          warning_notes: []
        }

        return { success: true, pending: false, recipe }
      }

      return { success: true, pending: true }
    } catch (err: any) {
      return { success: false, error: err.message || "Error interno al comprobar estado." }
    }
  }
}
