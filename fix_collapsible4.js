const fs = require('fs');

let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// Replace the unmatched </section> for Detalles Técnicos
f = f.replace(
  '</section>\n\n        {/* Vessel Details */}',
  '</CollapsibleSection>\n\n        {/* Vessel Details */}'
);

// Check if Pasos de Elaboración closing section needs fix
f = f.replace(
  '</section>\n\n        {/* Tags */}',
  '</CollapsibleSection>\n\n        {/* Tags */}'
);

// We need to also check if we replaced the opening tags successfully
if (!f.includes('<CollapsibleSection title="Detalles Técnicos">')) {
    f = f.replace(
      /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<h2 className="font-bold text-lg mb-4 text-charcoal border-b pb-2">Detalles[^<]+<\/h2>/,
      '<CollapsibleSection title="Detalles Técnicos">'
    );
}

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
