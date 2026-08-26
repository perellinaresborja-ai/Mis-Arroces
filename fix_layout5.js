const fs = require('fs');

let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

const regex = /<CollapsibleSection title="Ingredientes" rightAction=\{<Button[^>]+>\s*<Plus className="w-4 h-4 mr-1" \/> [A-Za-zñÃ±]+\s*<\/Button>\}>/g;

const newAction = `<CollapsibleSection title="Ingredientes" rightAction={
            <div className="flex items-center gap-1">
              <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="icon" />
              <Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
          }>`;

editForm = editForm.replace(regex, newAction);

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');
