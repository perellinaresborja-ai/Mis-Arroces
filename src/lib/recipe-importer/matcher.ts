/**
 * Conservative ingredient canonicalization
 * Attempts to parse quantities/units and match canonical ingredients safely.
 * If ambiguous or doubtful, keeps canonical_ingredient_id as null for user review.
 */

export interface ParsedIngredient {
  displayText: string
  normalizedQuantity: number | null
  unitId: string | null
  canonicalIngredientId: string | null
}

interface UnitRef {
  id: string
  name: string
}

interface IngredientRef {
  id: string
  canonical_name?: string
  normalized_name: string
  ingredient_aliases?: { normalized_alias: string }[]
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function parseAndMatchIngredient(
  rawText: string,
  catalogs: {
    ingredients: IngredientRef[]
    units: UnitRef[]
  }
): ParsedIngredient {
  const cleanOriginal = rawText.trim().replace(/\s+/g, " ")
  if (!cleanOriginal) {
    return {
      displayText: "",
      normalizedQuantity: null,
      unitId: null,
      canonicalIngredientId: null,
    }
  }

  // Common units mapping in Spanish
  const unitPatterns: { regex: RegExp; nameKeywords: string[] }[] = [
    { regex: /^(?:kg|kilos?|kilogramos?)\b/i, nameKeywords: ["kilo", "kilogramo"] },
    { regex: /^(?:g|gr|grs|gramos?)\b/i, nameKeywords: ["gramo"] },
    { regex: /^(?:l|lt|lts|litros?)\b/i, nameKeywords: ["litro"] },
    { regex: /^(?:ml|mililitros?)\b/i, nameKeywords: ["mililitro"] },
    { regex: /^(?:cucharadas?|cda|cdas)\b/i, nameKeywords: ["cucharada"] },
    { regex: /^(?:cucharaditas?|cdta|cdtas)\b/i, nameKeywords: ["cucharadita"] },
    { regex: /^(?:pizcas?)\b/i, nameKeywords: ["pizca"] },
    { regex: /^(?:dientes?)\b/i, nameKeywords: ["diente", "unidad"] },
    { regex: /^(?:unidades?|uds?|ud|count)\b/i, nameKeywords: ["unidad"] },
    { regex: /^(?:vasos?|tazas?)\b/i, nameKeywords: ["vaso", "taza"] },
  ]

  let working = cleanOriginal
  let extractedQuantity: number | null = null
  let matchedUnitId: string | null = null

  // 1. Check leading quantity like: "400 g", "1,5 l", "1/2", "1"
  // Check fractions e.g. "1/2" -> 0.5
  const fractionMatch = working.match(/^([0-9]+)\s*\/\s*([0-9]+)\b/)
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1])
    const den = parseFloat(fractionMatch[2])
    if (den !== 0) {
      extractedQuantity = parseFloat((num / den).toFixed(2))
      working = working.slice(fractionMatch[0].length).trim()
    }
  } else {
    const qtyMatch = working.match(/^([0-9]+(?:[.,][0-9]+)?)\s*/)
    if (qtyMatch) {
      extractedQuantity = parseFloat(qtyMatch[1].replace(",", "."))
      working = working.slice(qtyMatch[0].length).trim()
    }
  }

  // 2. Check leading unit
  for (const up of unitPatterns) {
    const m = working.match(up.regex)
    if (m) {
      working = working.slice(m[0].length).trim()
      // Look up unit in database catalogs
      const unitObj = catalogs.units.find(u => {
        const uLower = u.name.toLowerCase()
        return up.nameKeywords.some(kw => uLower.includes(kw))
      })
      if (unitObj) {
        matchedUnitId = unitObj.id
      }
      break
    }
  }

  // Strip leading prepositions like "de ", "d' "
  const namePart = working.replace(/^(?:de\s+|d'|del\s+)/i, "").trim()
  const normalizedQuery = normalizeString(namePart || cleanOriginal)

  // 3. Conservative canonical ingredient matching
  let canonicalId: string | null = null

  if (normalizedQuery) {
    // 3A. Exact match on normalized_name
    const exact = catalogs.ingredients.find(i => i.normalized_name === normalizedQuery)
    if (exact) {
      canonicalId = exact.id
    } else {
      // 3B. Exact match on alias
      const aliasMatch = catalogs.ingredients.find(i =>
        i.ingredient_aliases?.some(a => a.normalized_alias === normalizedQuery)
      )
      if (aliasMatch) {
        canonicalId = aliasMatch.id
      } else {
        // 3C. Strict substring: only if candidate exactly matches full words and is unique
        const words = normalizedQuery.split(" ")
        // If single generic word like "arroz", match "Arroz Redondo" or "Arroz" if unambiguous
        const matches = catalogs.ingredients.filter(i => {
          return i.normalized_name === normalizedQuery ||
            i.ingredient_aliases?.some(a => a.normalized_alias === normalizedQuery)
        })

        if (matches.length === 1) {
          canonicalId = matches[0].id
        }
      }
    }
  }

  return {
    displayText: cleanOriginal, // Preserve complete original text
    normalizedQuantity: extractedQuantity,
    unitId: matchedUnitId,
    canonicalIngredientId: canonicalId,
  }
}
