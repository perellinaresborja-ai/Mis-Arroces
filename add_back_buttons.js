const fs = require('fs');

function addBackButton(filePath, regexToReplace, replacement) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (!code.includes('BackButton')) {
    code = `import { BackButton } from "@/components/domain/BackButton"\n` + code;
    code = code.replace(regexToReplace, replacement);
    fs.writeFileSync(filePath, code);
    console.log(`Updated ${filePath}`);
  }
}

addBackButton(
  'src/app/recipes/[id]/edit/page.tsx',
  /<h1 className="font-bold truncate pr-4 text-foreground">Editar: \{recipe.name\}<\/h1>/,
  `<div className="flex items-center min-w-0"><BackButton /><h1 className="font-bold truncate pr-4 text-foreground">Editar: {recipe.name}</h1></div>`
);

addBackButton(
  'src/app/create/post/page.tsx',
  /<h1 className="text-3xl font-bold mb-8">Crear Publicación<\/h1>/,
  `<div className="flex items-center mb-8"><BackButton /><h1 className="text-2xl font-bold">Crear Publicación</h1></div>`
);

addBackButton(
  'src/app/sessions/[id]/edit/page.tsx',
  /<h1 className="text-2xl font-bold mb-6">Editar Cocinado<\/h1>/,
  `<div className="flex items-center mb-6"><BackButton /><h1 className="text-2xl font-bold">Editar Cocinado</h1></div>`
);

if (fs.existsSync('src/app/recipes/[id]/cook/page.tsx')) {
  addBackButton(
    'src/app/recipes/[id]/cook/page.tsx',
    /<h1 className="text-2xl font-bold mb-6">/,
    `<div className="flex items-center mb-6"><BackButton /><h1 className="text-2xl font-bold">`
  );
  addBackButton(
    'src/app/recipes/[id]/cook/page.tsx',
    /<h1 className="text-3xl font-bold">/,
    `<div className="flex items-center mb-6"><BackButton /><h1 className="text-2xl font-bold">`
  );
}
