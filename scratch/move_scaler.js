const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const regex = /\{\/\* Scaler \*\/\}[\s\S]*?<\/div>[\s\n]*\{\/\* Ingredients List \*\/\}[\s\S]*?<\/ul>\s*<\/div>/;

// The matched string contains Scaler block AND Ingredients List block.
const replacement = `{/* Top Header - Solo Ingredientes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-muted/40 p-4 rounded-2xl border border-border sm:h-[82px]">
          <h2 className="text-xl md:text-2xl font-bold font-serif text-charcoal">Ingredientes</h2>
        </div>
  
        {/* Ingredients List */}
        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-6 overflow-hidden shadow-sm">
          <ul className="space-y-1">
            {ingredients.map((ing: any) => {
              const scaledQty = ing.normalized_quantity ? (ing.normalized_quantity * scaleRatio) : null;
              return (
                <li key={ing.id} className="flex justify-between items-center text-[15px] py-3 border-b border-border/40 last:border-0">
                  <span className="text-foreground/90 pr-4">{ing.display_text}</span>
                  {scaledQty !== null && (
                    <span className="font-bold text-charcoal shrink-0 bg-muted/50 px-3 py-1.5 rounded-lg text-sm border border-border/50">
                      {+(scaledQty.toFixed(2))} {formatUnitSymbol(ing.unit?.name)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Scaler (Moved below list) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-muted/40 p-4 rounded-2xl border border-border sm:h-[82px]">
          <h2 className="text-lg md:text-xl font-bold font-serif text-charcoal">¿Para cuántos vas a cocinar?</h2>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">-</button>
            <span className="font-bold text-lg w-6 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary">+</button>
          </div>
        </div>`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log("Successfully moved Scaler and added Ingredientes title!");
} else {
  console.log("Could not find blocks to replace.");
}
