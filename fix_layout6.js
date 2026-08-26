const fs = require('fs');
let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

const target = '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>\n                <Plus className="w-4 h-4 mr-1" /> AÃ±adir\n              </Button>}>';

const target2 = '<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>\r\n                <Plus className="w-4 h-4 mr-1" /> AÃ±adir\r\n              </Button>}>';

const replacement = `<CollapsibleSection title="Ingredientes" rightAction={
            <div className="flex items-center gap-1">
              <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="icon" />
              <Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
          }>`;

if (editForm.includes(target)) {
  editForm = editForm.replace(target, replacement);
} else if (editForm.includes(target2)) {
  editForm = editForm.replace(target2, replacement);
} else {
  // Try split 
  const parts = editForm.split('<CollapsibleSection title="Ingredientes" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>');
  if (parts.length === 2) {
    const endParts = parts[1].split('</Button>}>');
    editForm = parts[0] + replacement + endParts.slice(1).join('</Button>}>');
  }
}

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');
