const fs = require('fs');

let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// 1. Remove the old horizontal button from the bottom
editForm = editForm.replace(
  '<div className="mt-6 pt-4 border-t border-border">\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="horizontal" />\n              </div>',
  ''
);

// 2. Change the rightAction in CollapsibleSection
const oldAction = '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>\n                <Plus className="w-4 h-4 mr-1" /> Añadir\n              </Button>}>';
const oldActionFallback = '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>\n                <Plus className="w-4 h-4 mr-1" /> AÃ±adir\n              </Button>}>';

const newAction = `<CollapsibleSection title="Ingredientes" rightAction={
            <div className="flex items-center gap-1">
              <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="icon" />
              <Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
          }>`;

if (editForm.includes(oldAction)) {
  editForm = editForm.replace(oldAction, newAction);
} else {
  // Regex to match ignoring mojibake
  const regex = /<CollapsibleSection title="Ingredientes" rightAction=\{<Button type="button" variant="outline" size="sm" onClick=\{[^\}]+\}>\s*<Plus className="w-4 h-4 mr-1" \/> [A-Za-zñÃ±]+\s*<\/Button>\}>/;
  editForm = editForm.replace(regex, newAction);
}

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');
