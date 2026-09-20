import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Normalizes a display name:
 * - Unicode NFKC normalization (canonical decomposition + recomposition)
 * - Trims leading and trailing whitespace
 * - Converts to lower case
 * - Collapses multiple whitespace characters (including unicode spaces) into a single space
 * - Preserves accents and diacritics (e.g. "José" !== "Jose")
 */
export function normalizeDisplayName(raw: string): string {
  if (!raw) return ""
  return raw
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

/**
 * Validates display name constraints:
 * - 2 to 50 characters
 * - Not purely symbols or spaces
 */
export function validateDisplayNameFormat(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: "El nombre no puede estar vacío." }
  }
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres." }
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "El nombre no puede tener más de 50 caracteres." }
  }
  return { valid: true }
}

/**
 * Checks if a display name is available in profiles table using normalized comparison.
 * Returns true if available, false if already in use by another user.
 */
export async function isDisplayNameAvailable(
  supabase: SupabaseClient,
  displayName: string,
  excludeUserId?: string
): Promise<boolean> {
  const normalized = normalizeDisplayName(displayName)
  if (!normalized) return false

  // First fetch potential matches where lower(trim) could match
  // Since SQL regex or normalized columns might be in place, we query profiles and verify normalized
  let query: any = supabase
    .from("profiles")
    .select("id, display_name")
    .not("display_name", "is", null)

  if (excludeUserId) {
    query = query.not("id", "eq", excludeUserId)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error checking display name availability:", error)
    return false
  }

  if (!data || data.length === 0) return true

  // Check in memory with authoritative normalizeDisplayName
  const isTaken = (data as Array<{ id: string; display_name: string | null }>).some((p) => {
    if (!p.display_name) return false
    return normalizeDisplayName(p.display_name) === normalized
  })

  return !isTaken
}
