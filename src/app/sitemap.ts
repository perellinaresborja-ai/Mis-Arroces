import { MetadataRoute } from "next"
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://misarroces.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://misarroces.com/discover",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ]
}
