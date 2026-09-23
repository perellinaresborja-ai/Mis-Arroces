import { ImportedRecipe, ImportResult } from "../types"
import { createAiRecipeDraft } from "@/app/actions/ai-recipe"
import { createClient } from "@/lib/supabase/server"

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

      let mediaBase64: string | undefined = undefined;
      let mediaMimeType: string | undefined = undefined;

      const mediaUrlToFetch = post.audioUrl || post.videoUrl;
      
      if (!rawCaption.trim() && !mediaUrlToFetch) {
        return {
          success: false,
          isInsufficient: true,
          error: "Esta publicación de Instagram no tiene texto ni audio del que extraer una receta."
        }
      }

      if (mediaUrlToFetch) {
        try {
          const mediaRes = await fetch(mediaUrlToFetch);
          if (mediaRes.ok) {
            const arrayBuffer = await mediaRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (buffer.length < 20 * 1024 * 1024) {
              mediaBase64 = buffer.toString('base64');
              mediaMimeType = post.audioUrl ? "audio/mp4" : "video/mp4";
            }
          }
        } catch (e) {
          console.error("Error downloading Instagram media for transcription:", e);
        }
      }

      const draftRes = await createAiRecipeDraft(`Contexto: Receta de Instagram (@${authorName})\n\n${rawCaption}`, mediaBase64, mediaMimeType)

      if (draftRes.error || !draftRes.recipeId) {
        return {
          success: false,
          isInsufficient: true,
          error: draftRes.error || "El texto de esta publicación no contiene una receta con ingredientes o pasos identificables."
        }
      }

      const supabase = await createClient();
      await (supabase.from("recipes") as any).update({
        source_url: post.url || url,
        source_platform: "INSTAGRAM",
        external_id: shortcode
      }).eq("id", draftRes.recipeId);

      return {
        success: true,
        recipeId: draftRes.recipeId
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Error al conectar con Instagram."
      }
    }
  }
}
