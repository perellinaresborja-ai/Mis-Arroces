/**
 * Basic pantry ingredients verified in the real database catalog.
 * These everyday basics do not count towards relevant required ingredients or missing counts:
 * - Sal, Sal en Escamas
 * - Aceite de Oliva Virgen Extra, Aceite de Girasol
 * - Agua
 * - Pimienta Negra, Pimienta Blanca, Pimienta Verde
 *
 * NOTE: Rice, broths/stocks, meats, fish, seafood, vegetables, and distinctive spices (saffron, pimentón, etc.)
 * are NOT basics and are strictly counted as relevant recipe ingredients.
 */
export const VERIFIED_BASIC_NORMALIZED_NAMES = new Set([
  'sal',
  'sal en escamas',
  'aceite de oliva virgen extra',
  'aceite de girasol',
  'agua',
  'pimienta negra',
  'pimienta blanca',
  'pimienta verde',
])

export interface MatchedRecipeResult {
  id: string
  name: string
  slug: string
  cover_image: string | null
  author: {
    id: string
    username: string
    display_name: string | null
    avatar_path: string | null
  } | null
  variety_name: string | null
  style_name: string | null
  total_relevant: number
  match_count: number
  missing_count: number
  missing_ingredients: string[]
  match_pct: number
}

export function isBasicIngredient(normalizedName: string | null | undefined): boolean {
  if (!normalizedName) return false
  return VERIFIED_BASIC_NORMALIZED_NAMES.has(normalizedName.trim().toLowerCase())
}
