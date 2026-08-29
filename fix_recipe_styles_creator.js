const fs = require('fs');

// Patch create/story/page.tsx
let pageCode = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');

pageCode = pageCode.replace(
  /initialRecipe=\{searchParams\?\.recipe_id \? \{ id: searchParams\.recipe_id, name: "Receta" \} : undefined\} /,
  `initialRecipe={recipeData ? { id: recipeData.id, name: recipeData.title, coverUrl: recipeMedia?.url } : undefined}`
);

if (!pageCode.includes('recipeData')) {
  pageCode = pageCode.replace(
    /const searchParams = await props\.searchParams;/,
    `const searchParams = await props.searchParams;
    let recipeData = null;
    let recipeMedia = null;
    if (searchParams?.recipe_id) {
      const { data } = await supabase.from('recipes').select('id, title').eq('id', searchParams.recipe_id).single();
      recipeData = data;
      const { data: media } = await supabase.from('recipe_media').select('url').eq('recipe_id', searchParams.recipe_id).order('position', {ascending: true}).limit(1).maybeSingle();
      recipeMedia = media;
    }`
  );
}
fs.writeFileSync('src/app/create/story/page.tsx', pageCode);

// Patch StoryCreator.tsx
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// Fix initialRecipe overlay payload to include coverUrl and default style
code = code.replace(
  /payload: \{ title: initialRecipe\.name, recipeId: initialRecipe\.id \}/,
  `payload: { title: initialRecipe.name, recipeId: initialRecipe.id, coverUrl: initialRecipe.coverUrl, displayStyle: 'card' }`
);

// Fix RecipePicker sticker payload to include displayStyle
code = code.replace(
  /if \(type === 'RECIPE'\) newOverlay = \{ \.\.\.common, type: 'RECIPE', payload: \{ title: data\.title, recipeId: data\.id \} \};/,
  `if (type === 'RECIPE') newOverlay = { ...common, type: 'RECIPE', payload: { title: data.title, recipeId: data.id, displayStyle: 'compact', coverUrl: (data as any).coverUrl } };`
);

// Render the style selector
const selectorUI = `
      {/* Recipe Style Selector */}
      {selectedOverlayId && overlays.find(o => o.id === selectedOverlayId)?.type === 'RECIPE' && (
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-2xl flex gap-3 z-[100] border border-white/20 shadow-2xl">
          {['card', 'compact', 'text'].map(style => {
            const ov = overlays.find(o => o.id === selectedOverlayId);
            const isActive = ov?.payload.displayStyle === style;
            return (
              <button 
                key={style}
                onClick={(e) => {
                  e.stopPropagation();
                  setOverlays(overlays.map(o => o.id === selectedOverlayId ? { ...o, payload: { ...o.payload, displayStyle: style } } : o));
                }}
                className={\`px-4 py-1.5 rounded-xl text-sm font-bold capitalize transition-colors \${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/20'}\`}
              >
                {style}
              </button>
            )
          })}
        </div>
      )}
`;

if (!code.includes('Recipe Style Selector')) {
  code = code.replace(
    /\{mode === 'EDIT' && \(/,
    selectorUI + '\n      {mode === \'EDIT\' && ('
  );
}

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Patched creator for recipe styles');
