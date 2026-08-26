const fs = require('fs');

let page = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

const sessionQueryRegex = /const \{ data: sessions \} = await supabase[\s\S]*?\.limit\(6\)/;
const newSessionQuery = `
  const { data: sessions } = await supabase
    .from("cooking_sessions")
    .select(\`
      id, date, rating, socarrat_level, modifications, visibility, status, scheduled_for,
      author:profiles!cooking_sessions_user_id_fkey(username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      session_media(display_order, media:media_assets(id, storage_path))
    \`)
    .eq("recipe_id", recipe.id)
    .eq("status", "PUBLISHED")
    .or("visibility.eq.PUBLIC")
    .lte("scheduled_for", new Date().toISOString()) // Solo mostrar ya publicadas
    .order("date", { ascending: false })
`;

page = page.replace(sessionQueryRegex, newSessionQuery);

// In header, add count
const headerRegex = /<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">([\s\S]*?)<\/div>/;
page = page.replace(headerRegex, (match, inner) => {
  return `<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
            ${inner}
            {sessions && sessions.length > 0 && (
              <span className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                Cocinado {sessions.length} {sessions.length === 1 ? 'vez' : 'veces'}
              </span>
            )}
          </div>`;
});

// Community sessions title
page = page.replace(
  '<h2 className="text-2xl font-bold mb-8 font-serif text-charcoal">Lo han cocinado</h2>',
  '<h2 className="text-2xl font-bold mb-8 font-serif text-charcoal">Resultados de la comunidad</h2>'
);

// Link session cards to detail page
const cardRegex = /<div key=\{s\.id\} className="bg-card border border-border p-4 rounded-3xl space-y-4">/;
page = page.replace(cardRegex, '<Link key={s.id} href={`/sessions/${s.id}`} className="block bg-card border border-border p-4 rounded-3xl space-y-4 hover:border-primary transition-colors">');

page = page.replace(
  /<\/div>\s*\}\)\}\s*<\/div>/,
  '</Link>\n              })}\n            </div>'
);

// We must also handle sessions map properly closing
page = page.replace(/<div key=\{s\.id\} className="bg-card border border-border p-4 rounded-3xl space-y-4 shadow-sm">/g, '<Link href={`/sessions/${s.id}`} key={s.id} className="block bg-card border border-border p-4 rounded-3xl space-y-4 shadow-sm hover:border-primary transition-colors">');

fs.writeFileSync('src/app/recipes/[id]/page.tsx', page, 'utf8');
