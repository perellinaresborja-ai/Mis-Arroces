import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW';

  const headers = {
    apikey: supabaseKey,
    Authorization: 'Bearer ' + supabaseKey,
  };

  let recipes: Array<{ id: string; updated_at?: string }> = [];
  let profiles: Array<{ username: string; updated_at?: string }> = [];

  try {
    const recipesRes = await fetch(
      supabaseUrl + '/rest/v1/recipes?status=eq.PUBLISHED&visibility=eq.PUBLIC&deleted_at=is.null&select=id,updated_at&order=updated_at.desc&limit=1000',
      { headers, cache: 'no-store' }
    );
    if (recipesRes.ok) {
      recipes = await recipesRes.json();
    }
  } catch (err) {
    console.error('Error fetching recipes for sitemap:', err);
  }

  try {
    const profilesRes = await fetch(
      supabaseUrl + '/rest/v1/profiles?privacy_level=eq.PUBLIC&username=not.is.null&select=username,updated_at&order=updated_at.desc&limit=1000',
      { headers, cache: 'no-store' }
    );
    if (profilesRes.ok) {
      profiles = await profilesRes.json();
    }
  } catch (err) {
    console.error('Error fetching profiles for sitemap:', err);
  }

  const nowIso = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  xml += '  <url>\n    <loc>' + baseUrl + '</loc>\n    <lastmod>' + nowIso + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>' + baseUrl + '/discover</loc>\n    <lastmod>' + nowIso + '</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n';

  for (const recipe of recipes) {
    const lastmod = recipe.updated_at ? new Date(recipe.updated_at).toISOString() : nowIso;
    xml += '  <url>\n    <loc>' + baseUrl + '/recipes/' + recipe.id + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n';
  }

  for (const profile of profiles) {
    const lastmod = profile.updated_at ? new Date(profile.updated_at).toISOString() : nowIso;
    xml += '  <url>\n    <loc>' + baseUrl + '/@' + profile.username + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n';
  }

  xml += '</urlset>';

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}