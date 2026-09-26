/**
 * International Phone Utilities and E.164 Normalization for misarroces
 */

export interface CountryDialInfo {
  code: string // ISO code: ES, MX, AR, US, etc.
  name: string
  dialCode: string // e.g. +34
  flag: string
}

export const SUPPORTED_COUNTRIES: CountryDialInfo[] = [
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "DE", name: "Alemania", dialCode: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", flag: "🇬🇧" },
  { code: "AD", name: "Andorra", dialCode: "+376", flag: "🇦🇩" },
]

/**
 * Normalizes any phone number into consistent E.164 format (+[country code][number]).
 * If empty, returns valid with empty string since phone is optional.
 */
export function normalizePhoneToE164(
  rawPhone: string | null | undefined,
  defaultPrefix: string = "+34"
): { valid: boolean; e164: string; error?: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return { valid: true, e164: "" }
  }

  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "")

  // Replace international access code 00 with +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.substring(2)
  }

  // If no leading +, apply defaultPrefix
  if (!cleaned.startsWith("+")) {
    const cleanPrefix = defaultPrefix.startsWith("+") ? defaultPrefix : `+${defaultPrefix}`
    cleaned = `${cleanPrefix}${cleaned}`
  }

  // Validate E.164: + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/
  if (!e164Regex.test(cleaned)) {
    return {
      valid: false,
      e164: "",
      error: "Introduce un número de teléfono válido con prefijo.",
    }
  }

  return { valid: true, e164: cleaned }
}

/**
 * Formats E.164 phone number cleanly for visual display to user.
 */
export function formatPhoneDisplay(e164: string): string {
  if (!e164) return ""
  // Format Spanish numbers (+34 600 00 00 00)
  if (e164.startsWith("+34") && e164.length === 12) {
    const num = e164.substring(3)
    return `+34 ${num.substring(0, 3)} ${num.substring(3, 5)} ${num.substring(5, 7)} ${num.substring(7, 9)}`
  }
  // Generic grouping
  if (e164.startsWith("+")) {
    return `${e164.substring(0, 3)} ${e164.substring(3)}`
  }
  return e164
}
