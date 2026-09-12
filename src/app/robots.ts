import { MetadataRoute } from "next"
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/settings",
        "/me",
        "/onboarding",
        "/shopping-list",
        "/create",
        "/messages",
        "/cookbook",
        "/auth",
        "/api",
        "/invite",
        "/update-password",
        "/forgot-password",
        "/profile/edit",
        "/profile/requests",
        "/profile/story-archive",
        "/profile/insights",
        "/recipes/*/edit",
        "/recipes/*/cook",
        "/recipes/*/mode",
        "/posts/*/edit",
        "/sessions/*/edit",
        "/p/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

