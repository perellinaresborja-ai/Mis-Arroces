const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Re-order Top Grid for Mobile (Image+Button first, Title+Desc second)
code = code.replace(
  '            {/* Left Column: Image & Actions */}\\n            <div className="md:col-span-5 order-2 md:order-1 flex flex-col gap-6">',
  '            {/* Left Column: Image & Actions */}\\n            <div className="md:col-span-5 order-1 flex flex-col gap-6">'
);
code = code.replace(
  '            {/* Right Column: Title, Desc, Stats, Ficha */}\\n            <div className="md:col-span-7 flex flex-col order-1 md:order-2">',
  '            {/* Right Column: Title, Desc, Stats, Ficha */}\\n            <div className="md:col-span-7 flex flex-col order-2">'
);

// 2. Compact Ficha Técnica
const oldFicha = `              {/* Technical Data Card */}
              <div className="mt-8 bg-muted/30 rounded-2xl p-6 border border-border/50 max-w-xl">
                <h3 className="font-bold text-lg mb-4 text-charcoal font-serif">Ficha TÃ©cnica</h3>
                <ul className="space-y-3 text-sm">
                  {recipe.variety && (
                    <li className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Variedad de arroz</span>
                      <span className="font-medium text-foreground">{recipe.variety.name}</span>
                    </li>
                  )}
                  {recipe.rice_qty && (
                    <li className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Cantidad de arroz</span>
                      <span className="font-medium text-foreground">{recipe.rice_qty}g</span>
                    </li>
                  )}
                  {recipe.stock_qty && (
                    <li className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Cantidad de caldo</span>
                      <span className="font-medium text-foreground">{recipe.stock_qty}ml</span>
                    </li>
                  )}
                  {ratio && (
                    <li className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">ProporciÃ³n</span>
                      <span className="font-medium text-foreground">1:{ratio}</span>
                    </li>
                  )}
                  {vesselDetails?.diameter_cm && (
                    <li className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Medida de paella</span>
                      <span className="font-medium text-foreground">{vesselDetails.diameter_cm} cm</span>
                    </li>
                  )}
                </ul>
              </div>`;

const newFicha = `              {/* Technical Data Card */}
              <div className="mt-8 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full">
                <h3 className="font-bold text-base mb-3 text-charcoal font-serif uppercase tracking-wider">Ficha TÃ©cnica</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                  {recipe.variety && (
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Variedad</span>
                      <span className="font-semibold text-foreground">{recipe.variety.name}</span>
                    </div>
                  )}
                  {recipe.rice_qty && (
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Arroz</span>
                      <span className="font-semibold text-foreground">{recipe.rice_qty}g</span>
                    </div>
                  )}
                  {recipe.stock_qty && (
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Caldo</span>
                      <span className="font-semibold text-foreground">{recipe.stock_qty}ml</span>
                    </div>
                  )}
                  {ratio && (
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">ProporciÃ³n</span>
                      <span className="font-semibold text-foreground">1:{ratio}</span>
                    </div>
                  )}
                  {vesselDetails?.diameter_cm && (
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Paella</span>
                      <span className="font-semibold text-foreground">{vesselDetails.diameter_cm} cm</span>
                    </div>
                  )}
                </div>
              </div>`;

code = code.replace(oldFicha, newFicha);

// 3. Reorder the bottom section
// The bottom section starts at: {/* Bottom Section: Ingredients & Steps */}

const bottomSectionRegex = /\{\/\* Bottom Section: Ingredients & Steps \*\/\}[\s\S]*?(?=\{\/\* Lo he cocinado CTA \*\/\}|\{\/\* Community Sessions \*\/\}|$)/;

const bottomContent = code.match(bottomSectionRegex);
if (bottomContent) {
  const oldBottom = bottomContent[0];
  
  // Extract Steps block (from {/* Steps (Right Column in Desktop) */} to the end of the div containing it)
  // We'll use a regex to extract the inner map block for steps, since extracting matched braces with regex is hard.
  // Actually, I'll just write a cleaner regex or replacement for the structural divs.
  
  const newBottom = `        {/* Bottom Section: Single Column Flow */}
        <div className="max-w-3xl mx-auto mt-12 md:mt-20 pt-10 border-t border-border flex flex-col items-center">
          
          {/* Ingredientes */}
          <div className="w-full">
            <InteractiveRecipeView recipe={recipe} isAuthenticated={!!user} />
          </div>

          {/* Receta Paso a Paso */}
          <div className="w-full mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold font-serif text-charcoal">Receta paso a paso</h2>
            </div>
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className="space-y-6">
                {[...recipe.steps].sort((a: any, b: any) => a.step_number - b.step_number).map((step: any) => {
                  const stepImageUrl = step.media?.storage_path 
                    ? \`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${step.media.storage_path}\`
                    : null;

                  return (
                    <div key={step.id} className="bg-card rounded-3xl border border-border p-5 md:p-7 overflow-hidden flex flex-col md:flex-row gap-5 md:gap-6 shadow-sm">
                      {/* Badge Paso */}
                      <div className="shrink-0 flex items-center md:items-start justify-between md:justify-start">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                          {step.step_number}
                        </div>
                        {/* En mÃ³vil la duraciÃ³n puede ir arriba a la derecha */}
                        <div className="md:hidden">
                          {step.duration_minutes && (
                            <span className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> {step.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1">
                        <p className="text-[16px] md:text-[17px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{step.instruction}</p>
                        
                        <div className="hidden md:flex flex-wrap gap-2 mt-4">
                          {step.duration_minutes && (
                            <span className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                              <Clock className="w-4 h-4 mr-1.5" /> {step.duration_minutes} min
                            </span>
                          )}
                        </div>
                        
                        {step.notes && (
                          <p className="text-sm text-muted-foreground mt-4 bg-muted/40 p-4 rounded-xl border border-border/50">
                            <strong>Nota:</strong> {step.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Imagen */}
                      {stepImageUrl && (
                        <div className="shrink-0 w-full md:w-32 lg:w-40 xl:w-48 mt-4 md:mt-0">
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 shadow-sm relative group">
                            <ExpandableImage src={stepImageUrl} alt={\`Paso \${step.step_number}\`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                              <span className="text-white text-xs font-bold uppercase tracking-widest">Ampliar</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-muted/30 border border-border p-8 rounded-3xl text-center">
                <p className="text-muted-foreground">Esta receta aÃºn no tiene pasos detallados.</p>
              </div>
            )}
          </div>

          {/* AlÃ©rgenos */}
          <div className="w-full mt-10">
            <AllergensSection result={nutrition} />
          </div>

          {/* NutriciÃ³n (Collapsible) */}
          <div className="w-full mt-6 mb-8">
            <details className="group bg-card rounded-3xl border border-border overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-5 font-bold text-lg cursor-pointer flex justify-between items-center bg-muted/10 hover:bg-muted/30 transition-colors">
                InformaciÃ³n Nutricional
                <svg className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="p-1 pt-0">
                <NutritionSection result={nutrition} servings={recipe.base_servings || 1} hideTitle />
              </div>
            </details>
          </div>
          
        </div>

`;

  code = code.replace(oldBottom, newBottom);
} else {
  console.log("Could not find bottom section regex");
}

fs.writeFileSync(targetFile, code);
console.log("Transformation completed successfully.");
