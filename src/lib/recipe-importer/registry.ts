import { detectPlatformAndNormalizeUrl } from "./detector"
import { WebRecipeAdapter } from "./adapters/web-recipe.adapter"
import { TikTokAdapter } from "./adapters/tiktok.adapter"
import { YouTubeAdapter } from "./adapters/youtube.adapter"
import { InstagramAdapter } from "./adapters/instagram.adapter"
import { ImportResult } from "./types"

const webAdapter = new WebRecipeAdapter()
const tikTokAdapter = new TikTokAdapter()
const youTubeAdapter = new YouTubeAdapter()
const instagramAdapter = new InstagramAdapter()

export async function fetchRecipeFromAnyUrl(rawUrl: string): Promise<ImportResult> {
  const detection = detectPlatformAndNormalizeUrl(rawUrl)

  switch (detection.platform) {
    case "WEB":
      return await webAdapter.extract(detection.normalizedUrl)

    case "TIKTOK":
      return await tikTokAdapter.extract(detection.normalizedUrl, detection.externalId)

    case "YOUTUBE":
      return await youTubeAdapter.extract(detection.normalizedUrl, detection.externalId)

    case "INSTAGRAM":
      return await instagramAdapter.extract(detection.normalizedUrl, detection.externalId)

    default:
      return {
        success: false,
        error: "Plataforma no compatible."
      }
  }
}
