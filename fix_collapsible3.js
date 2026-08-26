const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// Technical Details
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<h2 className="font-bold text-lg mb-4 text-charcoal border-b pb-2">Detalles[^<]+<\/h2>/,
  '<CollapsibleSection title="Detalles Técnicos">'
);
if (f.includes('<CollapsibleSection title="Detalles Técnicos">') && f.includes('</section>\n\n        {/* Vessel */}')) {
  f = f.replace('</section>\n\n        {/* Vessel */}', '</CollapsibleSection>\n\n        {/* Vessel */}');
}

// Steps
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<div className="flex justify-between items-center border-b pb-2 mb-4">\s*<h2 className="font-semibold text-lg">Pasos de Elabora[^<]+<\/h2>\s*<Button type="button" variant="outline" size="sm" onClick=\{\(\) => appendStep/,
  '<CollapsibleSection title="Pasos de Elaboración" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendStep'
);

if (f.includes('<CollapsibleSection title="Pasos de Elaboración"') && f.includes('</section>\n\n        {/* Tags */}')) {
    f = f.replace('</section>\n\n        {/* Tags */}', '</CollapsibleSection>\n\n        {/* Tags */}');
}

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
