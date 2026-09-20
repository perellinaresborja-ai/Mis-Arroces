import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Normalizes a username:
 * - Trims whitespace
 * - Converts to lower case
 * - Strips any leading '@'
 */
export function normalizeUsername(raw: string): string {
  if (!raw) return ""
  let clean = raw.trim().toLowerCase()
  if (clean.startsWith("@")) {
    clean = clean.slice(1)
  }
  return clean
}

/**
 * Validates whether a username satisfies the system rules:
 * - 3 to 30 characters
 * - lowercase letters, digits, underscores, or dots
 */
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const normalized = normalizeUsername(username)
  if (!normalized || normalized.length < 3) {
    return { valid: false, error: "El nombre de usuario debe tener al menos 3 caracteres." }
  }
  if (normalized.length > 30) {
    return { valid: false, error: "El nombre de usuario no puede tener más de 30 caracteres." }
  }
  const regex = /^[a-z0-9_.]{3,30}$/
  if (!regex.test(normalized)) {
    return {
      valid: false,
      error: "Solo se permiten letras minúsculas, números, puntos y guiones bajos.",
    }
  }

  const reservedNames = [
    "admin",
    "administrator",
    "misarroces",
    "support",
    "soporte",
    "official",
    "moderator",
    "moderador",
    "system",
  ]
  if (reservedNames.includes(normalized)) {
    return { valid: false, error: "Este nombre de usuario no está disponible." }
  }

  return { valid: true }
}

/**
 * Checks if a username is available in profiles table (case-insensitive).
 * Returns true if available, false if already in use.
 */
export async function isUsernameAvailable(
  supabase: SupabaseClient,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const normalized = normalizeUsername(username)
  if (!normalized) return false

  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalized)

  if (excludeUserId) {
    query = query.not("id", "eq", excludeUserId)
  }

  const { data, error } = await query.maybeSingle()
  if (error && error.code !== "PGRST116") {
    console.error("Error checking username availability:", error)
  }
  return !data
}

/**
 * Generates an available unique username starting with base (default: 'arrocero').
 */
export async function generateAvailableUsername(
  supabase: SupabaseClient,
  basePrefix: string = "arrocero"
): Promise<string> {
  const cleanPrefix = normalizeUsername(basePrefix).replace(/[^a-z0-9_.]/g, "") || "arrocero"
  
  for (let i = 0; i < 15; i++) {
    const candidate = `${cleanPrefix}${Math.floor(100000 + Math.random() * 900000)}`
    const available = await isUsernameAvailable(supabase, candidate)
    if (available) {
      return candidate
    }
  }

  // Fallback with timestamp to guarantee uniqueness
  return `${cleanPrefix}${Date.now().toString().slice(-6)}`
}
