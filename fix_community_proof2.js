const fs = require('fs');

let f = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

const badgeHtml = `
                  {(publicCookCount || 0) >= 5 && (
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-sm mb-3">
                      ✓ Probada por la comunidad
                    </div>
                  )}
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">
`;

f = f.replace(
  '<h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif \ntracking-tight">',
  badgeHtml
);
f = f.replace(
  '<h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">',
  badgeHtml
);

f = f.replace(
  'const { data: sessions } = await supabase',
  'const { data: sessions, count: publicCookCount } = await supabase'
);

f = f.replace(
  '      .select(`\n        *,\n        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),\n        session_media(media:media_assets(id, storage_path))\n      `)',
  '      .select(`\n        *,\n        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),\n        session_media(media:media_assets(id, storage_path))\n      `, { count: "exact" })'
);

f = f.replace(
  '.eq("privacy_level", "PUBLIC")',
  '.eq("status", "PUBLISHED").eq("visibility", "PUBLIC")'
);


fs.writeFileSync('src/app/recipes/[id]/page.tsx', f, 'utf8');
