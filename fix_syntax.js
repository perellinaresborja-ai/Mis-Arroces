const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// Fix Ingredientes
f = f.replace(
  /<CollapsibleSection title="Ingredientes" rightAction=\{<Button type="button" variant="outline" size="sm" onClick=\{\(\) => appendIng\(\{ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true \}\)\}>\s*<Plus className="w-4 h-4 mr-1" \/> AÃ±adir\s*<\/Button>\s*<\/div>/,
  '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}><Plus className="w-4 h-4 mr-1" /> Añadir</Button>}>'
);

// Fallback if formatting was different
f = f.replace(
  /<\/Button>\s*<\/div>\s*<div className="space-y-4">\s*\{ingFields\.map/,
  '</Button>}>\n          \n          <div className="space-y-4">\n            {ingFields.map'
);

// Fix Pasos
f = f.replace(
  /<CollapsibleSection title="Pasos de ElaboraciÃ³n" rightAction=\{<Button type="button" variant="outline" size="sm" onClick=\{\(\) => appendStep\(\{ step_number: stepFields\.length \+ 1, content: "" \}\)\}>\s*<Plus className="w-4 h-4 mr-1" \/> AÃ±adir\s*<\/Button>\s*<\/div>/,
  '<CollapsibleSection title="Pasos de Elaboración" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendStep({ step_number: stepFields.length + 1, content: "" })}><Plus className="w-4 h-4 mr-1" /> Añadir</Button>}>'
);

f = f.replace(
  /<\/Button>\s*<\/div>\s*<div className="space-y-6">\s*\{stepFields\.map/,
  '</Button>}>\n          \n          <div className="space-y-6">\n            {stepFields.map'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
