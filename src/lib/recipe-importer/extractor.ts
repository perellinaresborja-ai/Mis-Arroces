/**
 * Schema.org Recipe parser
 * Safely extracts recipe data from HTML containing JSON-LD scripts
 */

export interface ExtractedRecipeData {
  name: string
  description?: string | null
  recipeYield?: number | null
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  totalTimeMinutes?: number | null
  ingredients: string[]
  instructions: { instruction: string; notes?: string | null }[]
  keywords?: string[]
}

// Parses ISO 8601 duration (e.g. PT1H15M, PT20M, P0DT1H, PT45S) into total minutes
export function parseIsoDurationToMinutes(durationStr?: string | null): number | null {
  if (!durationStr || typeof durationStr !== "string") return null
  const match = durationStr.match(/P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/i)
  if (!match) return null

  const days = parseInt(match[1] || "0", 10)
  const hours = parseInt(match[2] || "0", 10)
  const minutes = parseInt(match[3] || "0", 10)
  const seconds = parseInt(match[4] || "0", 10)

  const total = days * 1440 + hours * 60 + minutes + Math.round(seconds / 60)
  return total > 0 ? total : null
}

// Parses recipeYield (e.g. "4", 4, ["4 personas"], "4 raciones", "4-6") into an integer
export function parseRecipeYield(yieldVal?: any): number | null {
  if (yieldVal === null || yieldVal === undefined) return null

  if (typeof yieldVal === "number" && yieldVal > 0) {
    return Math.round(yieldVal)
  }

  let text = ""
  if (Array.isArray(yieldVal)) {
    text = String(yieldVal[0] || "")
  } else {
    text = String(yieldVal)
  }

  // Look for first number in string
  const numMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)/)
  if (numMatch) {
    const parsed = Math.round(parseFloat(numMatch[1].replace(",", ".")))
    if (parsed > 0 && parsed < 200) return parsed
  }
  return null
}

// Clean HTML tags and decode basic HTML entities
function cleanHtmlText(text?: string | null): string {
  if (!text) return ""
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

// Flatten instructions recursively (supporting strings, HowToStep, HowToSection)
function extractInstructionSteps(rawInstructions: any): { instruction: string; notes?: string | null }[] {
  const steps: { instruction: string; notes?: string | null }[] = []

  if (!rawInstructions) return steps

  // If it's a single string with multiple lines or paragraphs
  if (typeof rawInstructions === "string") {
    const cleaned = cleanHtmlText(rawInstructions)
    if (cleaned) {
      // If contains line breaks, split by steps
      const parts = cleaned.split(/(?:\r?\n)+/).map(p => p.trim()).filter(Boolean)
      if (parts.length > 1) {
        for (const p of parts) {
          // Remove leading step numbers like "1. ", "Paso 1: "
          const text = p.replace(/^(?:paso\s*)?[0-9]+[\.\-\:\)]\s*/i, "").trim()
          if (text) steps.push({ instruction: text })
        }
      } else {
        steps.push({ instruction: cleaned })
      }
    }
    return steps
  }

  if (Array.isArray(rawInstructions)) {
    for (const item of rawInstructions) {
      if (!item) continue

      if (typeof item === "string") {
        const text = cleanHtmlText(item).replace(/^(?:paso\s*)?[0-9]+[\.\-\:\)]\s*/i, "").trim()
        if (text) steps.push({ instruction: text })
      } else if (typeof item === "object") {
        const type = item["@type"]
        if (type === "HowToStep") {
          const text = cleanHtmlText(item.text || item.name || item.description)
          const notes = item.name && item.text && item.name !== item.text ? cleanHtmlText(item.name) : null
          if (text) steps.push({ instruction: text, notes })
        } else if (type === "HowToSection" || item.itemListElement) {
          // Section contains nested steps
          const nested = extractInstructionSteps(item.itemListElement)
          steps.push(...nested)
        } else if (item.text || item.name) {
          const text = cleanHtmlText(item.text || item.name)
          if (text) steps.push({ instruction: text })
        }
      }
    }
  }

  return steps
}

export function extractRecipeFromJsonLd(html: string): ExtractedRecipeData {
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  let foundRecipe: any = null

  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())

      const findRecipeInObj = (obj: any): any => {
        if (!obj || typeof obj !== "object") return null

        // Check direct @type: "Recipe" or @type including "Recipe"
        const type = obj["@type"]
        if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
          return obj
        }

        // Check array
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const res = findRecipeInObj(item)
            if (res) return res
          }
        }

        // Check @graph array
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          for (const item of obj["@graph"]) {
            const res = findRecipeInObj(item)
            if (res) return res
          }
        }

        return null
      }

      const candidate = findRecipeInObj(parsed)
      if (candidate) {
        foundRecipe = candidate
        break
      }
    } catch {
      // Ignore JSON parse errors in malformed script tags
    }
  }

  if (!foundRecipe) {
    throw new Error("No hemos podido detectar una receta compatible en esta página.")
  }

  const name = cleanHtmlText(foundRecipe.name)
  if (!name) {
    throw new Error("La receta encontrada no tiene un título válido.")
  }

  const description = cleanHtmlText(foundRecipe.description) || null

  // Extract ingredients array
  const rawIngredients = foundRecipe.recipeIngredient || foundRecipe.ingredients || []
  const ingredients: string[] = []
  if (Array.isArray(rawIngredients)) {
    for (const ing of rawIngredients) {
      if (typeof ing === "string") {
        const cleaned = cleanHtmlText(ing)
        if (cleaned) ingredients.push(cleaned)
      }
    }
  } else if (typeof rawIngredients === "string") {
    const parts = rawIngredients.split(/(?:\r?\n)+/).map(p => cleanHtmlText(p)).filter(Boolean)
    ingredients.push(...parts)
  }

  // Extract instructions array
  const instructions = extractInstructionSteps(foundRecipe.recipeInstructions)

  // Extract servings & times without inventing
  const recipeYield = parseRecipeYield(foundRecipe.recipeYield)
  const prepTimeMinutes = parseIsoDurationToMinutes(foundRecipe.prepTime)
  const cookTimeMinutes = parseIsoDurationToMinutes(foundRecipe.cookTime)
  const totalTimeMinutes = parseIsoDurationToMinutes(foundRecipe.totalTime)

  return {
    name,
    description,
    recipeYield,
    prepTimeMinutes,
    cookTimeMinutes,
    totalTimeMinutes,
    ingredients,
    instructions,
  }
}
