const fs = require('fs');
let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// The replacement logic:
const popularBlockRegex = /<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">\s*\{homeData\.popular\.map\(\(r\) => \{[\s\S]*?\}\)\}\s*<\/div>/g;

const recentBlockRegex = /<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">\s*\{homeData\.recent\.map\(\(r\) => \{[\s\S]*?\}\)\}\s*<\/div>/g;

const replacementGenerator = (arrayName) => `<div className="grid grid-cols-3 gap-1 md:gap-4 pb-4">
              {${arrayName}.map((r) => {
                const media = r.recipe_media?.[0]?.media?.storage_path
                const imgUrl = media ? \`\${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/\${media}\` : null
                return (
                  <Link key={r.id} href={\`/recipes/\${r.id}\`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="aspect-square bg-muted relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sand/30 text-muted-foreground/50">Sin foto</div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-bold text-sm line-clamp-1">{r.name}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1">@{r.author?.username}</p>
                    </div>
                  </Link>
                )
              })}
            </div>`;

code = code.replace(popularBlockRegex, replacementGenerator('homeData.popular'));
code = code.replace(recentBlockRegex, replacementGenerator('homeData.recent'));

fs.writeFileSync('src/app/discover/page.tsx', code);
console.log('Fixed discover grids completely');
