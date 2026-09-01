const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove the StartCookButton from the Left Column
const btnBlock = /<div className="w-full">\s*<StartCookButton recipeId=\{recipe\.id\} \/>\s*<\/div>/;
if (btnBlock.test(code)) {
  code = code.replace(btnBlock, '');
} else {
  console.log("Could not find button block in Left column");
}

// 2. Change items-start to items-center for the top grid
code = code.replace(
  'className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start"',
  'className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"'
);

// 3. Add the StartCookButton after Ficha Técnica (at the end of the Right Column)
// The right column ends with `</div>` right before `{/* Bottom Section: Single Column Flow */}`
// Wait, looking at the layout:
/*
                </div>
              </div>
            </div>
          </div>
  
                  {/* Bottom Section: Single Column Flow *\/}
*/
// The innermost </div> is closing the `Ficha Técnica` card.
// The next </div> is closing the `md:col-span-7` right column!
// Wait! I need to insert it right before the </div> that closes `md:col-span-7`.
// Actually, it's safer to just inject it directly after the Ficha Tecnica block.

const fichaEnd = /<span className="font-semibold text-foreground">1:\{ratio\}<\/span>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*<\/div>/;

if (fichaEnd.test(code)) {
  code = code.replace(
    fichaEnd,
    `$&
              
              <div className="w-full mt-8 flex justify-center">
                <div className="w-full sm:w-2/3 md:w-3/4">
                  <StartCookButton recipeId={recipe.id} />
                </div>
              </div>`
  );
} else {
  console.log("Could not find Ficha end!");
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Moved button and centered grid successfully!");
