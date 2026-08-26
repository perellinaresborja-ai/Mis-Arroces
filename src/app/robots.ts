import { MetadataRoute } from "next"
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/*",
      disallow: ["/settings", "/me", "/onboarding", "/shopping-list", "/create"],
    },
    sitemap: "https://misarroces.com/sitemap.xml",
  }
}
