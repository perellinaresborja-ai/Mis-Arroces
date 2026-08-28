const fs = require('fs');
let code = fs.readFileSync('src/app/recipes/[id]/page.tsx', 'utf8');

// The block:
//               {!isOwner && (
//                   <div className="shrink-0 flex gap-2">
//                       <SaveRecipeButton recipeId={recipe.id} initialSaved={isSaved} isAuthenticated={!!user} />
//                       <WantToCookButton recipeId={recipe.id} initialSaved={isWantToCook} isAuthenticated={!!user} />
//                   </div>
//                 )}

const regex = /\{\!isOwner && \(\s*<div className="shrink-0 flex gap-2">/g;
if (regex.test(code)) {
    code = code.replace(regex, '{!isOwner && (\n                  <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">');
    fs.writeFileSync('src/app/recipes/[id]/page.tsx', code);
    console.log('Replaced buttons wrapper!');
} else {
    console.log('Regex did not match');
}
