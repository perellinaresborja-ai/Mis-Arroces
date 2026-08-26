const fs = require('fs');

let f = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

f = f.replace(
  'const { data: sessions } = await supabase',
  'const { data: sessions, count: publicCookCount } = await supabase'
);

f = f.replace(
  '      .select(`',
  '      .select(`\n        *,\n        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),\n        session_media(media:media_assets(id, storage_path))\n      `, { count: "exact" }) // '
);
// Make sure it compiles safely
f = f.replace(
  '      .select(`\n        *,\n        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),\n        session_media(media:media_assets(id, storage_path))\n      `)',
  '      .select(`\n        *,\n        author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),\n        session_media(media:media_assets(id, storage_path))\n      `, { count: "exact" })'
);

// Note: checking for 'privacy_level' which might be 'status' and 'visibility' based on the migration
f = f.replace(
  '.eq("privacy_level", "PUBLIC")',
  '.eq("status", "PUBLISHED").eq("visibility", "PUBLIC")'
);

const communityBadge = `
            <div className="md:col-span-7 space-y-6">
              
              <div className="space-y-4">
                {(publicCookCount || 0) >= 5 && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-sm animate-in fade-in zoom-in-95">
                    <Check className="w-3.5 h-3.5" /> Probada por la comunidad
                  </div>
                )}
`;

f = f.replace(
  '<div className="md:col-span-7 space-y-6">\n              \n              <div className="space-y-4">',
  communityBadge
);

// Inject import Check if not exists
if (!f.includes('Check,')) {
  f = f.replace('import { CheckCircle2', 'import { CheckCircle2, Check');
}

fs.writeFileSync('src/app/recipes/[id]/page.tsx', f, 'utf8');
