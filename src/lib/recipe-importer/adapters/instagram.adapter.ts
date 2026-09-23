import { ImportedRecipe, ImportResult } from "../types"
import { parseRecipeFreeText } from "@/app/actions/ai-recipe"

export class InstagramAdapter {
  async extract(url: string, shortcode: string | null): Promise<ImportResult> {
    try {
      if (!shortcode) {
        return {
          success: false,
          error: "No se ha podido identificar el enlace de la publicación o Reel de Instagram."
        }
      }

      const apifyToken = process.env.APIFY_API_TOKEN

      if (!apifyToken) {
        return {
          success: false,
          missingConfig: true,
          error: "La importación desde Instagram requiere configurar APIFY_API_TOKEN en el servidor."
        }
      }

      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=60`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000)

      let res: Response
      try {
        res = await fetch(apifyUrl, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directUrls: [url], resultsType: "details" }),
          signal: controller.signal 
        })
      } catch (err: any) {
        clearTimeout(timeout)
        if (err.name === "AbortError") {
          return { success: false, error: "La extracción de Instagram ha tardado demasiado. Por favor, vuelve a intentarlo." }
        }
        throw err
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        return {
          success: false,
          error: "Instagram ha bloqueado el acceso a la publicación o el servicio de extracción está saturado."
        }
      }

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "No se encontró información en esta URL. ¿Es posible que sea una cuenta privada?"
        }
      }

      const post = data[0]
      if (post.error) {
        return {
          success: false,
          error: post.errorDescription || "Publicación no accesible o cuenta privada."
        }
      }

      const rawCaption: string = post.caption || ""
      const authorName: string = post.ownerFullName || post.ownerUsername || "Instagram"

      if (!rawCaption.trim()) {
        return {
          success: false,
          isInsufficient: true,
          error: "Esta publicación de Instagram no tiene texto o pie de foto del que extraer una receta."
        }
      }

      const parsed = await parseRecipeFreeText(`Contexto: Receta de Instagram (@${authorName})\n\n${rawCaption}`)

      if (parsed.error || !parsed.data) {
        return {
          success: false,
          isInsufficient: true,
          error: parsed.error || "El texto de esta publicación no contiene una receta con ingredientes o pasos identificables."
        }
      }

      const aiData = parsed.data;
      
      const ingredients = aiData.ingredients ? aiData.ingredients.map((ing: any) => ({ raw_text: ing.raw_text })) : [];
      if (aiData.rice_qty && aiData.rice_variety_hint) {
         ingredients.unshift({ raw_text: `${aiData.rice_qty}g de ${aiData.rice_variety_hint}` });
      } else if (aiData.rice_variety_hint) {
         ingredients.unshift({ raw_text: `${aiData.rice_variety_hint}` });
      }
      if (aiData.stock_qty && aiData.stock_ingredient_hint) {
         ingredients.unshift({ raw_text: `${aiData.stock_qty}ml de ${aiData.stock_ingredient_hint}` });
      } else if (aiData.stock_ingredient_hint) {
         ingredients.unshift({ raw_text: `${aiData.stock_ingredient_hint}` });
      }

      const instructions = aiData.instructions ? aiData.instructions.map((inst: any, idx: number) => ({
         step_number: idx + 1,
         text: inst.instruction,
         notes: inst.notes || null
      })) : [];

      const isComplete = ingredients.length > 0 && instructions.length > 0

      const recipe: ImportedRecipe = {
        source_platform: "INSTAGRAM",
        source_url: post.url || url,
        external_id: shortcode,
        title: aiData.title || `Receta de @${authorName}`,
        description: aiData.description || null,
        author_name: authorName,
        servings: aiData.servings ?? null,
        prep_time_minutes: aiData.prep_time_minutes ?? null,
        cook_time_minutes: aiData.cook_time_minutes ?? null,
        total_time_minutes: aiData.cook_time_minutes ?? null, // Fallback if no total time
        ingredients,
        instructions,
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
