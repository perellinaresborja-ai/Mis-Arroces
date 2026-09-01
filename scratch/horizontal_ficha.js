const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const regex = /\{\/\* Technical Data Card \*\/\}[\s\S]*?<\/div>\s*<\/div>/;

const newFicha = `{/* Technical Data Card */}
            <div className="mt-8 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full">
              <h3 className="font-bold text-base mb-3 text-charcoal font-serif uppercase tracking-wider">Ficha Técnica</h3>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                {recipe.variety && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Variedad de arroz:</span>
                    <span className="font-semibold text-foreground">{recipe.variety.name}</span>
                  </div>
                )}
                {recipe.rice_qty && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Cantidad de arroz:</span>
                    <span className="font-semibold text-foreground">{recipe.rice_qty}g</span>
                  </div>
                )}
                {recipe.stock_qty && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Cantidad de caldo:</span>
                    <span className="font-semibold text-foreground">{recipe.stock_qty}ml</span>
                  </div>
                )}
                {vesselDetails?.diameter_cm && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Medida de paella:</span>
                    <span className="font-semibold text-foreground">{vesselDetails.diameter_cm} cm</span>
                  </div>
                )}
                {ratio && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Proporción:</span>
                    <span className="font-semibold text-foreground">1:{ratio}</span>
                  </div>
                )}
              </div>
            </div>`;

if (regex.test(code)) {
  code = code.replace(regex, newFicha);
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log("Successfully replaced Ficha Técnica with horizontal flex-wrap layout!");
} else {
  console.log("Could not find Ficha Técnica to replace.");
}
