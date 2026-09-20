import { AuthError } from "@supabase/supabase-js"

/**
 * Normalizes an email address consistently across the app:
 * - Trims whitespace
 * - Converts to lower case
 */
export function normalizeEmail(raw: string): string {
  if (!raw) return ""
  return raw.trim().toLowerCase()
}

/**
 * Maps Supabase Auth errors to clear, friendly Spanish messages.
 * Never exposes raw English technical errors to the user.
 */
export function getFriendlyAuthErrorMessage(
  error: AuthError | { message?: string; code?: string; status?: number } | null | undefined,
  context: "login" | "signup" | "reset" = "login"
): string {
  if (!error) return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."

  const code = (error.code || "").toLowerCase()
  const message = (error.message || "").toLowerCase()

  // 1. Invalid credentials
  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "El correo o la contraseña no son correctos."
  }

  // 2. User already exists / registered
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("user already registered") ||
    message.includes("already registered") ||
    message.includes("email address already in use")
  ) {
    return "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña."
  }

  // 3. Email not confirmed
  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "Por favor, confirma tu correo electrónico antes de entrar. Revisa tu bandeja de entrada."
  }

  // 4. Weak password
  if (
    code === "weak_password" ||
    message.includes("password should be at least") ||
    message.includes("weak password")
  ) {
    return "La contraseña debe tener al menos 6 caracteres."
  }

  // 5. Rate limit / too many requests
  if (
    code === "over_request_rate_limit" ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "Demasiados intentos seguidos. Por favor, espera unos minutos e inténtalo de nuevo."
  }

  // Default fallbacks according to context
  if (context === "login") {
    return "El correo o la contraseña no son correctos."
  }
  if (context === "signup") {
    return "No se ha podido crear la cuenta. Por favor, revisa tus datos e inténtalo de nuevo."
  }

  return "Ha ocurrido un error. Por favor, inténtalo de nuevo."
}
