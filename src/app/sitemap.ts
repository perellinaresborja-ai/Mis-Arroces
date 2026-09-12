import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch only public, published, non-deleted recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, updated_at')
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1000);

  // Fetch only public profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .eq('privacy_level', 'PUBLIC')
    .not('username', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1000);

  const recipeEntries: MetadataRoute.Sitemap = (recipes || []).map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.id}`,
    lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const profileEntries: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `${baseUrl}/@${profile.username}`,
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
    ...recipeEntries,
    ...profileEntries
  ];
}

