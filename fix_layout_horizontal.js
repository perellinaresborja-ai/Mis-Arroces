const fs = require('fs');

let btn = fs.readFileSync('src/components/domain/AddToCartButton.tsx', 'utf8');

// Add layout prop
btn = btn.replace(
  'export function AddToCartButton({ recipeId, isAuthenticated }: { recipeId: string, isAuthenticated: boolean }) {',
  'export function AddToCartButton({ recipeId, isAuthenticated, layout = "vertical" }: { recipeId: string, isAuthenticated: boolean, layout?: "horizontal" | "vertical" }) {'
);

// Update class name
btn = btn.replace(
  '<div className="mt-6 flex flex-col gap-3 w-full max-w-[380px]">',
  '{/* @ts-ignore */}\n    <div className={`mt-6 flex gap-3 w-full ${layout === "horizontal" ? "flex-row" : "flex-col max-w-[380px]"}`}>'
);

// Shorten text if horizontal
btn = btn.replace(
  '<ShoppingCart className="w-5 h-5" /> AÃ±adir ingredientes a mi compra',
  '{layout === "horizontal" ? <><ShoppingCart className="w-5 h-5" /> Añadir a la compra</> : <><ShoppingCart className="w-5 h-5" /> Añadir ingredientes a mi compra</>}'
);
btn = btn.replace(
  '<Check className="w-5 h-5" /> AÃ±adido a mi compra',
  '<Check className="w-5 h-5" /> Añadido'
);
btn = btn.replace(
  '<ListChecks className="w-5 h-5" /> Ver mi lista de compra',
  '{layout === "horizontal" ? <><ListChecks className="w-5 h-5" /> Ver lista</> : <><ListChecks className="w-5 h-5" /> Ver mi lista de compra</>}'
);

// If the classname on the buttons is w-full, in horizontal it should be flex-1
btn = btn.replace(
  'className="flex items-center justify-center gap-2 w-full py-3 bg-card border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors disabled:opacity-50"',
  'className={`flex items-center justify-center gap-2 py-3 bg-card border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors disabled:opacity-50 text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-2" : "w-full"}`}'
);

btn = btn.replace(
  'className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-colors"',
  'className={`flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-colors text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-2" : "w-full"}`}'
);

// We need to also clean up the AÃ±adir replacements in case they were already fixed.
// Let's just do a clean rewrite to be safe.
fs.writeFileSync('src/components/domain/AddToCartButton.tsx', btn, 'utf8');

// Update EditRecipeForm to pass layout="horizontal" and change flex layout to stack
let editForm = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');
editForm = editForm.replace(
  '<div className="mt-6 pt-4 border-t border-border flex justify-between items-center">\n                <p className="text-sm text-muted-foreground">Â¿Vas a prepararlo pronto?</p>\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} />\n              </div>',
  '<div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">\n                <p className="text-sm text-muted-foreground">¿Vas a prepararlo pronto?</p>\n                <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="horizontal" />\n              </div>'
);
fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', editForm, 'utf8');

