import { MetadataRoute } from "next"
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/settings", "/me", "/onboarding", "/shopping-list", "/create", "/messages"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
