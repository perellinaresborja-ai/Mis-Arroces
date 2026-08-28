const fs = require('fs');

let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// 1. Add recent to homeData interface
code = code.replace(
  'let homeData = { popular: [] as any[], users: [] as any[] }',
  'let homeData = { popular: [] as any[], recent: [] as any[], users: [] as any[] }'
);

// 2. Fetch recent recipes
const oldUsersFetch = `const { data: users } = await supabase.from("profiles").select(\``;
const newRecentAndUsersFetch = `const { data: recentRecipes } = await supabase.from("recipes").select(\`
        *,
        author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        recipe_media(media:media_assets(id, storage_path))
      \`).eq("status", "PUBLISHED").order("created_at", { ascending: false }).limit(10)
      if (recentRecipes) homeData.recent = recentRecipes;

      const { data: users } = await supabase.from("profiles").select(\``;

code = code.replace(oldUsersFetch, newRecentAndUsersFetch);

fs.writeFileSync('src/app/discover/page.tsx', code);
