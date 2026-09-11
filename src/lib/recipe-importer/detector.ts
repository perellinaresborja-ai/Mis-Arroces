import { SourcePlatform } from "./types"

export interface DetectionResult {
  platform: SourcePlatform
  normalizedUrl: string
  externalId: string | null
}

/**
 * Detects platform from URL and normalizes tracking params
 */
export function detectPlatformAndNormalizeUrl(rawUrl: string): DetectionResult {
  let parsed: URL
  try {
    parsed = new URL(rawUrl.trim())
  } catch {
    throw new Error("El enlace proporcionado no es una dirección web válida.")
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "")
  const pathname = parsed.pathname

  // 1. YouTube & YouTube Shorts
  // Formats:
  // - youtube.com/watch?v=VIDEO_ID
  // - youtu.be/VIDEO_ID
  // - youtube.com/shorts/VIDEO_ID
  // - m.youtube.com/...
  if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtu.be") {
    let videoId: string | null = null

    if (hostname === "youtu.be") {
      videoId = pathname.slice(1).split("/")[0] || null
    } else if (pathname.startsWith("/shorts/")) {
      videoId = pathname.replace(/^\/shorts\//, "").split("/")[0] || null
    } else if (pathname === "/watch") {
      videoId = parsed.searchParams.get("v")
    }

    if (videoId) {
      // Clean video ID (alphanumeric, -, _)
      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "")
      return {
        platform: "YOUTUBE",
        normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
        externalId: videoId,
      }
    }

    return {
      platform: "YOUTUBE",
      normalizedUrl: parsed.origin + parsed.pathname,
      externalId: null,
    }
  }

  // 2. Instagram
  // Formats:
  // - instagram.com/p/SHORTCODE/...
  // - instagram.com/reel/SHORTCODE/...
  // - instagram.com/reels/SHORTCODE/...
  if (hostname === "instagram.com" || hostname === "instagr.am") {
    const isReel = pathname.startsWith("/reel/") || pathname.startsWith("/reels/")
    const match = pathname.match(/^\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i)
    const shortcode = match ? match[1] : null

    let cleanPath = pathname
    if (shortcode) {
      cleanPath = isReel ? `/reel/${shortcode}/` : `/p/${shortcode}/`
    }
    return {
      platform: "INSTAGRAM",
      normalizedUrl: `https://www.instagram.com${cleanPath}`,
      externalId: shortcode,
    }
  }

  // 3. TikTok
  // Formats:
  // - tiktok.com/@user/video/VIDEO_ID
  // - vm.tiktok.com/SHORT_ID
  // - vt.tiktok.com/SHORT_ID
  // - m.tiktok.com/...
  if (
    hostname === "tiktok.com" ||
    hostname === "m.tiktok.com" ||
    hostname === "vm.tiktok.com" ||
    hostname === "vt.tiktok.com"
  ) {
    let videoId: string | null = null
    const videoMatch = pathname.match(/\/video\/([0-9]+)/)
    if (videoMatch) {
      videoId = videoMatch[1]
    }

    // Keep path clean of query parameters
    return {
      platform: "TIKTOK",
      normalizedUrl: `https://${parsed.hostname}${pathname}`,
      externalId: videoId,
    }
  }

  // 4. Fallback: Generic Recipe Web
  // Remove common marketing/tracking queries (utm_*, igsh, fbclid, etc.)
  const cleanSearchParams = new URLSearchParams()
  for (const [key, value] of parsed.searchParams.entries()) {
    if (
      !key.startsWith("utm_") &&
      key !== "fbclid" &&
      key !== "gclid" &&
      key !== "igsh" &&
      key !== "si"
    ) {
      cleanSearchParams.set(key, value)
    }
  }

  const queryStr = cleanSearchParams.toString()
  const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${queryStr ? "?" + queryStr : ""}`

  return {
    platform: "WEB",
    normalizedUrl: cleanUrl,
    externalId: null,
  }
}
