const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// The one before Escandallo
f = f.replace(
  '</section>\n\n          <EscandalloSection',
  '</CollapsibleSection>\n\n          <EscandalloSection'
);

// Any other floating `</section>` before Steps?
f = f.replace(
  '</section>\n\n          {/* Steps */}',
  '</CollapsibleSection>\n\n          {/* Steps */}'
);

f = f.replace(
  '</section>\n\n        {/* Tags */}',
  '</CollapsibleSection>\n\n        {/* Tags */}'
);

f = f.replace(
  '</section>\n\n        {/* Schedule / Publish Controls */}',
  '</CollapsibleSection>\n\n        {/* Schedule / Publish Controls */}'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
