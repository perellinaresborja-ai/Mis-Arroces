import { z } from "zod"

/**
 * Strict Extraction Schema
 * Rules:
 * - Extractor, not a cook.
 * - Missing info must be null or empty array. Never invent ingredients, times or steps.
 */
export const ExtractedRecipeAiSchema = z.object({
  title: z.string().nullable().describe("Nombre o título de la receta. Si no hay título claro, null"),
  servings: z.number().nullable().describe("Número de comensales/raciones SOLO si se indica textualmente. Si no, null"),
  prep_time_minutes: z.number().nullable().describe("Tiempo de preparación en minutos SOLO si se indica expresamente. Si no, null"),
  cook_time_minutes: z.number().nullable().describe("Tiempo de cocción en minutos SOLO si se indica expresamente. Si no, null"),
  total_time_minutes: z.number().nullable().describe("Tiempo total en minutos SOLO si se indica expresamente. Si no, null"),
  ingredients: z.array(
    z.object({
      raw_text: z.string().describe("Texto íntegro original del ingrediente con su cantidad si existe (ej. '400g arroz bomba', '1 cebolla')")
    })
  ).default([]).describe("Lista de ingredientes mencionados"),
  instructions: z.array(
    z.object({
      step_number: z.number(),
      text: z.string().describe("Instrucción del paso"),
      notes: z.string().nullable().optional()
    })
  ).default([]).describe("Pasos descritos explícitamente en el contenido")
})

export type ExtractedRecipeAi = z.infer<typeof ExtractedRecipeAiSchema>

export interface AiParserResult {
  recipe: ExtractedRecipeAi | null
  rawSourceText: string
  isInsufficient: boolean
  error?: string
}

/**
 * Parses free-form text into structured recipe using Google Gemini or OpenAI if API key exists.
 * If no AI API key is configured, falls back to conservative regex/line parsing.
 */
export async function parseRecipeTextWithAi(
  sourceText: string,
  contextTitle?: string | null
): Promise<AiParserResult> {
  const cleanText = sourceText.trim()
  if (!cleanText || cleanText.length < 15) {
    return {
      recipe: null,
      rawSourceText: cleanText,
      isInsufficient: true,
      error: "El contenido no contiene suficiente texto para extraer una receta."
    }
  }

  // Check for server-side API keys
  const geminiApiKey = process.env.GEMINI_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (geminiApiKey) {
    try {
      return await parseWithGemini(cleanText, contextTitle, geminiApiKey)
    } catch (err: any) {
      console.error("Gemini parser error, falling back to heuristic:", err)
    }
  } else if (openaiApiKey) {
    try {
      return await parseWithOpenAI(cleanText, contextTitle, openaiApiKey)
    } catch (err: any) {
      console.error("OpenAI parser error, falling back to heuristic:", err)
    }
  }

  // Fallback heuristic parser when no AI key is configured
  return parseWithHeuristics(cleanText, contextTitle)
}

async function parseWithGemini(
  text: string,
  contextTitle: string | null | undefined,
  apiKey: string
): Promise<AiParserResult> {
  const systemPrompt = `Eres un extractor de datos técnicos de cocina para la aplicación 'Mis Arroces'.
Tu labor es ESTRUCTURAR EXCLUSIVAMENTE la información que el creador ha escrito explícitamente.
REGLAS OBLIGATORIAS:
1. TIENES ESTRICTAMENTE PROHIBIDO inferir o inventar ingredientes, cantidades, tiempos o pasos.
2. Si una cantidad no se especifica, devuélvela como null o en el texto sin forzar números falsos.
3. Si las raciones o comensales no se mencionan expresamente, servings DEBE SER null.
4. Si los tiempos no se mencionan expresamente, DEBEN SER null.
5. Si el texto no contiene una receta real sino solo comentarios o hashtags ("qué rico", "buen domingo"), devuelve ingredients: [] e instructions: [].
Responde ÚNICAMENTE con un JSON válido que cumpla este esquema:
{
  "title": string | null,
  "servings": number | null,
  "prep_time_minutes": number | null,
  "cook_time_minutes": number | null,
  "total_time_minutes": number | null,
  "ingredients": [{"raw_text": string}],
  "instructions": [{"step_number": number, "text": string, "notes": string | null}]
}`

  const userContent = `Título de la publicación: ${contextTitle || "No especificado"}
Texto de la publicación:
${text}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }
        ],
        generationConfig: {
          temperature: 0.0,
          responseMimeType: "application/json"
        }
      })
    }
  )

  if (!res.ok) {
    throw new Error(`Gemini API respondió con estado ${res.status}`)
  }

  const json = await res.json()
  const rawResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawResponseText) throw new Error("Respuesta vacía de Gemini")

  const parsed = JSON.parse(rawResponseText)
  const validated = ExtractedRecipeAiSchema.parse(parsed)

  const isInsufficient = validated.ingredients.length === 0 && validated.instructions.length === 0

  return {
    recipe: validated,
    rawSourceText: text,
    isInsufficient
  }
}

async function parseWithOpenAI(
  text: string,
  contextTitle: string | null | undefined,
  apiKey: string
): Promise<AiParserResult> {
  const systemPrompt = `Eres un extractor de datos técnicos de cocina.
Estructura EXCLUSIVAMENTE lo que el creador ha escrito explícitamente.
PROHIBIDO inferir o inventar información no presente. Si no se indica: null.
Responde únicamente en JSON.`

  const userContent = `Título: ${contextTitle || "Sin título"}
Texto:
${text}`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ]
    })
  })

  if (!res.ok) throw new Error(`OpenAI respondió con ${res.status}`)

  const json = await res.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error("Respuesta vacía de OpenAI")

  const parsed = JSON.parse(content)
  const validated = ExtractedRecipeAiSchema.parse(parsed)
  const isInsufficient = validated.ingredients.length === 0 && validated.instructions.length === 0

  return {
    recipe: validated,
    rawSourceText: text,
    isInsufficient
  }
}

/**
 * Deterministic line-by-line fallback parser for captions without AI
 */
function parseWithHeuristics(
  text: string,
  contextTitle?: string | null
): AiParserResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const ingredients: { raw_text: string }[] = []
  const instructions: { step_number: number; text: string; notes?: string | null }[] = []

  let inIngredients = false
  let inInstructions = false

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (lower.startsWith("ingrediente") || lower.includes("🛒") || lower.includes("ingredientes:")) {
      inIngredients = true
      inInstructions = false
      continue
    }
    if (lower.startsWith("paso") || lower.startsWith("preparaci") || lower.startsWith("elaboraci") || lower.includes("👩‍🍳")) {
      inIngredients = false
      inInstructions = true
      continue
    }

    if (inIngredients) {
      const clean = line.replace(/^[•\-\*·\d+\.]\s*/, "").trim()
      if (clean && clean.length > 2 && !clean.startsWith("#")) {
        ingredients.push({ raw_text: clean })
      }
    } else if (inInstructions) {
      const clean = line.replace(/^(?:paso\s*)?\d+[\.\-\:]\s*/i, "").trim()
      if (clean && clean.length > 3 && !clean.startsWith("#")) {
        instructions.push({
          step_number: instructions.length + 1,
          text: clean
        })
      }
    } else {
      // Check if line looks like an ingredient e.g. "400g de arroz" or "- 2 tomates"
      if (/^[-•\*·]\s*[0-9]/.test(line) || /^[0-9]+(?:\s*(?:g|kg|ml|l|cda|cdta|diente|cebolla|tomate))/i.test(line)) {
        ingredients.push({ raw_text: line.replace(/^[-•\*·]\s*/, "") })
      }
    }
  }

  const isInsufficient = ingredients.length === 0 && instructions.length === 0

  return {
    recipe: {
      title: contextTitle || null,
      servings: null,
      prep_time_minutes: null,
      cook_time_minutes: null,
      total_time_minutes: null,
      ingredients,
      instructions
    },
    rawSourceText: text,
    isInsufficient
  }
}
