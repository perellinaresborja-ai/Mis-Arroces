const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Fix missing recipe_vessels in the query
if (!code.includes('recipe_vessels(*),')) {
  code = code.replace(
    'heat:heat_sources(name),\\n        media:recipe_media(media_assets(id, storage_path, is_deleted)),',
    'heat:heat_sources(name),\\n        recipe_vessels(*),\\n        media:recipe_media(media_assets(id, storage_path, is_deleted)),'
  );
  // Just in case \r\n
  code = code.replace(
    'heat:heat_sources(name),\\r\\n        media:recipe_media(media_assets(id, storage_path, is_deleted)),',
    'heat:heat_sources(name),\\r\\n        recipe_vessels(*),\\r\\n        media:recipe_media(media_assets(id, storage_path, is_deleted)),'
  );
}

// 2. Compact Ficha Técnica via Regex
const fichaRegex = /\{\/\* Technical Data Card \*\/\}[\s\S]*?<\/ul>\s*<\/div>/;

const newFicha = `            {/* Technical Data Card */}
            <div className="mt-8 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full">
              <h3 className="font-bold text-base mb-3 text-charcoal font-serif uppercase tracking-wider">Ficha Técnica</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                {recipe.variety && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Variedad de arroz</span>
                    <span className="font-semibold text-foreground">{recipe.variety.name}</span>
                  </div>
                )}
                {recipe.rice_qty && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Cantidad de arroz</span>
                    <span className="font-semibold text-foreground">{recipe.rice_qty}g</span>
                  </div>
                )}
                {recipe.stock_qty && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Cantidad de caldo</span>
                    <span className="font-semibold text-foreground">{recipe.stock_qty}ml</span>
                  </div>
                )}
                {ratio && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Proporción</span>
                    <span className="font-semibold text-foreground">1:{ratio}</span>
                  </div>
                )}
                {vesselDetails?.diameter_cm && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Medida de paella</span>
                    <span className="font-semibold text-foreground">{vesselDetails.diameter_cm} cm</span>
                  </div>
                )}
              </div>
            </div>`;

if (fichaRegex.test(code)) {
  code = code.replace(fichaRegex, newFicha);
  fs.writeFileSync(targetFile, code);
  console.log("Successfully replaced Ficha Técnica and updated query!");
} else {
  console.error("COULD NOT FIND ficha via regex!");
}
