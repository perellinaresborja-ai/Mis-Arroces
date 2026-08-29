const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

code = code.replace(
  /<Link href=\{\`\/recipes\/\$\{recipe\.id\}\/edit\`\} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-sm">\s*<Pencil className="w-4 h-4 mr-2" \/> Editar\s*<\/Link>/g,
  `<Link href={\`/recipes/\${recipe.id}/edit\`} className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 transition-colors shadow-sm">\n                      <Pencil className="w-4 h-4 mr-2" /> Editar\n                    </Link>`
);

fs.writeFileSync('src/app/recipes/[id]/page.tsx', code);
console.log('Fixed recipe detail edit button color');
