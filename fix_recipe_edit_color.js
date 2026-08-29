const fs = require('fs');

let code = fs.readFileSync('src/components/domain/OwnerRecipeActions.tsx', 'utf8');

// Replace standard 'secondary' variant Edit buttons with orange
// 1) Draft state edit button
code = code.replace(
  /<Button variant="secondary" className="font-semibold shadow-sm">\s*<Pencil className="w-4 h-4 mr-2 text-muted-foreground" \/> Editar\s*<\/Button>/g,
  '<Button className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">\n                  <Pencil className="w-4 h-4 mr-2" /> Editar\n                </Button>'
);

// 2) Published/Scheduled state edit button (font-bold)
code = code.replace(
  /<Button variant="secondary" className="font-bold shadow-sm">\s*<Pencil className="w-4 h-4 mr-2 text-muted-foreground" \/> Editar\s*<\/Button>/g,
  '<Button className="font-bold bg-[#E69A21] hover:bg-[#E69A21]/90 text-white border-0 shadow-sm">\n                  <Pencil className="w-4 h-4 mr-2" /> Editar\n                </Button>'
);

fs.writeFileSync('src/components/domain/OwnerRecipeActions.tsx', code);
console.log('Fixed OwnerRecipeActions edit button color');
