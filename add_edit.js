const fs = require('fs');

let file = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

const regex = /<h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">\s*\{recipe\.name\}\s*<\/h1>\s*<\/div>/;

file = file.replace(regex, `<h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif tracking-tight">
                  {recipe.name}
                </h1>
              </div>
              {isOwner && (
                <div className="shrink-0 flex gap-2">
                  <Link href={\`/recipes/\${recipe.id}/edit\`} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Link>
                </div>
              )}`);

fs.writeFileSync('src/app/recipes/[id]/page.tsx', file, 'utf8');
