import dns from "dns/promises"
import { URL } from "url"

// Range check helpers
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return true

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true

  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true

  // 172.16.0.0/12 (Private)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure metadata)
  if (parts[0] === 169 && parts[1] === 254) return true

  // 0.0.0.0/8 (Current network)
  if (parts[0] === 0) return true

  // 100.64.0.0/10 (Shared address space / CGNAT)
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
  if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true
  if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true
  if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (parts[0] >= 224) return true

  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  // Loopback ::1
  if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true
  // Unspecified ::
  if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true
  // Unique Local Address fc00::/7 (fc00:: - fdff::)
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true
  // Link-local fe80::/10
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (lower.includes("::ffff:")) {
    const v4 = lower.split("::ffff:")[1]
    if (v4 && isPrivateIPv4(v4)) return true
  }
  return false
}

export async function validateSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error("No parece un enlace válido.")
  }

  // Only http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Solo se permiten enlaces web (http o https).")
  }

  const hostname = parsed.hostname.toLowerCase()

  // Block obvious localhost/local domain names
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".corp") ||
    hostname === "metadata.google.internal" ||
    hostname === "instance-data"
  ) {
    throw new Error("Destino no permitido.")
  }

  // Resolve hostname via DNS to inspect destination IP
  try {
    const lookupResult = await dns.lookup(hostname, { all: true })
    if (!lookupResult || lookupResult.length === 0) {
      throw new Error("No se ha podido resolver la dirección web.")
    }

    for (const record of lookupResult) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new Error("Destino no permitido.")
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new Error("Destino no permitido.")
      }
    }
  } catch (err: any) {
    if (err.message === "Destino no permitido.") throw err
    throw new Error("No hemos podido conectar con la dirección indicada.")
  }

  return parsed
}

export async function safeFetchHtml(url: string, maxRedirects = 3): Promise<string> {
  let currentUrl = url
  let redirectsCount = 0

  while (redirectsCount <= maxRedirects) {
    const validatedUrl = await validateSafeUrl(currentUrl)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    let res: Response
    try {
      res = await fetch(validatedUrl.toString(), {
        method: "GET",
        signal: controller.signal,
        redirect: "manual", // Handle redirects manually to enforce SSRF validation at every hop
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MisArrocesBot/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        },
      })
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === "AbortError") {
        throw new Error("No hemos podido acceder a esta página. Inténtalo de nuevo.")
      }
      throw new Error("No hemos podido acceder a esta página web.")
    } finally {
      clearTimeout(timeout)
    }

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location")
      if (!location) {
        throw new Error("Redirección inválida.")
      }
      // Resolve relative redirect URL
      const nextUrl = new URL(location, validatedUrl).toString()
      currentUrl = nextUrl
      redirectsCount++
      continue
    }

    if (!res.ok) {
      throw new Error(`La página respondió con estado ${res.status}.`)
    }

    const contentType = res.headers.get("content-type") || ""
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("El enlace proporcionado no es una página web HTML.")
    }

    // Limit download size to 2.5 MB to avoid memory exhaustion
    const reader = res.body?.getReader()
    if (!reader) {
      const text = await res.text()
      if (text.length > 2.5 * 1024 * 1024) {
        throw new Error("La página web supera el límite de tamaño permitido.")
      }
      return text
    }

    const chunks: Uint8Array[] = []
    let totalBytes = 0
    const maxBytes = 2.5 * 1024 * 1024 // 2.5MB

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        totalBytes += value.length
        if (totalBytes > maxBytes) {
          reader.cancel()
          throw new Error("La página web supera el límite de tamaño permitido.")
        }
        chunks.push(value)
      }
    }

    const decoder = new TextDecoder("utf-8")
    let fullHtml = ""
    for (const chunk of chunks) {
      fullHtml += decoder.decode(chunk, { stream: true })
    }
    fullHtml += decoder.decode()
    return fullHtml
  }

  throw new Error("Demasiadas redirecciones al intentar acceder a la receta.")
}
