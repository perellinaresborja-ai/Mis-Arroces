import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es';

  let recipes: Array<{ id: string; updated_at?: string | null }> = [];
  let profiles: Array<{ username: string; updated_at?: string | null }> = [];

  try {
    const supabase = await createClient();

    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('id, updated_at')
      .eq('status', 'PUBLISHED')
      .eq('visibility', 'PUBLIC')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (recipesError) {
      console.error('Sitemap fetch error for recipes:', {
        entity: 'recipes',
        code: recipesError.code,
        message: recipesError.message,
      });
    } else if (recipesData) {
      recipes = recipesData;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .eq('privacy_level', 'PUBLIC')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (profilesError) {
      console.error('Sitemap fetch error for profiles:', {
        entity: 'profiles',
        code: profilesError.code,
        message: profilesError.message,
      });
    } else if (profilesData) {
      profiles = profilesData;
    }
  } catch (err: any) {
    console.error('Sitemap initialization unexpected error:', {
      entity: 'sitemap_client',
      name: err?.name,
      message: err?.message,
    });
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static routes (omit artificial lastmod so crawlers are not fed fabricated modification times)
  xml += `  <url>\n    <loc>${escapeXml(baseUrl)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${escapeXml(baseUrl + '/discover')}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${escapeXml(baseUrl + '/sobre-misarroces')}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

  for (const recipe of recipes) {
    const loc = `${baseUrl}/recipes/${recipe.id}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    if (recipe.updated_at) {
      const lastmodIso = new Date(recipe.updated_at).toISOString();
      xml += `    <lastmod>${lastmodIso}</lastmod>\n`;
    }
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  for (const profile of profiles) {
    const loc = `${baseUrl}/@${profile.username}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    if (profile.updated_at) {
      const lastmodIso = new Date(profile.updated_at).toISOString();
      xml += `    <lastmod>${lastmodIso}</lastmod>\n`;
    }
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
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