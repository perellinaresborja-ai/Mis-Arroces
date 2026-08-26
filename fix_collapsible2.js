const fs = require('fs');

let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// 1. Basic Info
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<div className="space-y-2 mb-6">\s*<Label>Foto de Portada \(Obligatoria\)<\/Label>/,
  '<CollapsibleSection title="Información Básica" defaultOpen={true}>\n          <div className="space-y-2 mb-6">\n            <Label>Foto de Portada (Obligatoria)</Label>'
);
// The closing </section> for basic info is before {/* Technical Details */}
f = f.replace(
  /<\/section>\s*\{\/\* Technical Details \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Technical Details */}'
);

// 2. Technical Details
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<h2 className="font-bold text-lg mb-4 text-charcoal border-b pb-2">Detalles TÃ©cnicos<\/h2>/,
  '<CollapsibleSection title="Detalles Técnicos">'
);
// Closing before {/* Vessel */}
f = f.replace(
  /<\/section>\s*\{\/\* Vessel \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Vessel */}'
);

// 3. Vessel
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<h2 className="font-bold text-lg mb-4 text-charcoal border-b pb-2">Recipiente<\/h2>/,
  '<CollapsibleSection title="Recipiente">'
);
// Closing before {/* Ingredients */}
f = f.replace(
  /<\/section>\s*\{\/\* Ingredients \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Ingredients */}'
);

// 4. Ingredients
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<div className="flex justify-between items-center border-b pb-2 mb-4">\s*<h2 className="font-semibold text-lg">Ingredientes<\/h2>\s*<Button type="button" variant="outline" size="sm" onClick=\{\(\) => appendIng/,
  '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng'
);
// Closing before {/* Steps */}
f = f.replace(
  /<\/section>\s*\{\/\* Steps \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Steps */}'
);

// 5. Steps
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<div className="flex justify-between items-center border-b pb-2 mb-4">\s*<h2 className="font-semibold text-lg">Pasos de ElaboraciÃ³n<\/h2>\s*<Button type="button" variant="outline" size="sm" onClick=\{\(\) => appendStep/,
  '<CollapsibleSection title="Pasos de Elaboración" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendStep'
);
// Closing before {/* Tags */}
f = f.replace(
  /<\/section>\s*\{\/\* Tags \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Tags */}'
);

// 6. Tags
f = f.replace(
  /<section className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">\s*<h2 className="font-semibold text-lg border-b pb-2 mb-4">Etiquetas \(Tags\)<\/h2>/,
  '<CollapsibleSection title="Etiquetas (Tags)">'
);
// Closing before {/* Schedule / Publish Controls */}
f = f.replace(
  /<\/section>\s*\{\/\* Schedule \/ Publish Controls \*\/\}/,
  '</CollapsibleSection>\n\n        {/* Schedule / Publish Controls */}'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
