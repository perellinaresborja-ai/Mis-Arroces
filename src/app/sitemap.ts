import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Fetch dynamic routes
  const { data: recipes } = await supabase.from('recipes').select('id, updated_at').order('updated_at', { ascending: false }).limit(500);
  const { data: profiles } = await supabase.from('profiles').select('username, updated_at').order('updated_at', { ascending: false }).limit(500);

  const recipeEntries: MetadataRoute.Sitemap = (recipes || []).map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.id}`,
    lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const profileEntries: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `${baseUrl}/${profile.username}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cookbook`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...recipeEntries,
    ...profileEntries
  ];
}
