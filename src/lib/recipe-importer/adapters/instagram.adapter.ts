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

      // 1. Iniciar Actor de forma asíncrona (POST /runs)
      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${apifyToken}`
      const res = await fetch(apifyUrl, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directUrls: [url], resultsType: "details" })
      })

      if (!res.ok) {
        return { success: false, error: "Error al iniciar la extracción en Instagram." }
      }

      const data = await res.json()
      if (!data.data || !data.data.id) {
        return { success: false, error: "No se pudo obtener el ID del proceso de Instagram." }
      }

      // Devolver inmediatamente para que el cliente haga polling
      return { success: true, isAsync: true, runId: data.data.id }
    } catch (err: any) {
      return { success: false, error: err.message || "Error al conectar con Instagram." }
    }
  }

  async checkStatus(runId: string): Promise<ImportResult & { pending?: boolean }> {
    try {
      const apifyToken = process.env.APIFY_API_TOKEN
      if (!apifyToken) return { success: false, error: "Falta APIFY_API_TOKEN." }

      const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      const res = await fetch(statusUrl, { cache: "no-store" })
      if (!res.ok) return { success: false, error: "Error al consultar estado a Apify." }

      const data = await res.json()
      const status = data.data.status

      if (status === "READY" || status === "RUNNING") {
        return { success: true, pending: true }
      }

      if (status === "FAILED" || status === "ABORTING" || status === "ABORTED" || status === "TIMING-OUT" || status === "TIMED-OUT") {
        return { success: false, error: `La extracción en Instagram falló (Estado: ${status}).` }
      }

      if (status === "SUCCEEDED") {
        const datasetId = data.data.defaultDatasetId
        const dsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
        const dsRes = await fetch(dsUrl, { cache: "no-store" })
        const items = await dsRes.json()

        if (!Array.isArray(items) || items.length === 0) {
          return { success: false, error: "No se encontró información en esta URL. ¿Es posible que sea una cuenta privada?" }
        }

        const post = items[0]
        if (post.error) {
          return { success: false, error: post.errorDescription || "Publicación no accesible o cuenta privada." }
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
          const mediaController = new AbortController();
          const mediaTimeout = setTimeout(() => mediaController.abort(), 15000);
          try {
            const mediaRes = await fetch(mediaUrlToFetch, { signal: mediaController.signal });
            if (mediaRes.ok) {
              const contentLength = parseInt(mediaRes.headers.get("content-length") || "0", 10);
              if (contentLength < 20 * 1024 * 1024) {
                const arrayBuffer = await mediaRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                if (buffer.length < 20 * 1024 * 1024) {
                  mediaBase64 = buffer.toString("base64");
                  mediaMimeType = post.audioUrl ? "audio/mp4" : "video/mp4";
                }
              } else {
                console.log("Instagram media too large to transcribe:", contentLength);
              }
            }
          } catch (e) {
            console.error("Error downloading Instagram media for transcription:", e);
          } finally {
            clearTimeout(mediaTimeout);
          }
        }

        const draftRes = await createAiRecipeDraft(`Contexto: Receta de Instagram (@${authorName})\n\n${rawCaption}`, mediaBase64, mediaMimeType)

        if (draftRes.error || !draftRes.recipeId) {
          return {
            success: false,
            isInsufficient: true,
            error: draftRes.error || "El texto de esta publicación no contiene una receta identificable."
          }
        }

        const supabase = await createClient();
        await (supabase.from("recipes") as any).update({
          source_url: post.url || `https://www.instagram.com/p/${post.shortCode || "unknown"}`,
          source_platform: "INSTAGRAM",
          external_id: post.shortCode || null
        }).eq("id", draftRes.recipeId);

        return {
          success: true,
          pending: false,
          recipeId: draftRes.recipeId
        }
      }

      return { success: true, pending: true }
    } catch (err: any) {
      return { success: false, error: err.message || "Error interno al comprobar estado de Instagram." }
    }
  }
}
