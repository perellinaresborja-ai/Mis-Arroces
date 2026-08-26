const fs = require('fs');
let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

f = f.replace(
  '{rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}',
  '{isOpen && rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}'
);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
