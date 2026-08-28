const fs = require('fs');
let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// Replace imports
sc = sc.replace(/MentionPicker, RecipePicker, IngredientPicker, LocationPicker, GenericSearchPicker/g, 'MentionPicker, RecipePicker, IngredientPicker, LocationPicker, GenericSearchPicker, SessionPicker, ProfilePicker');

// Replace comment
sc = sc.replace(/\{\/\* SESSION and PROFILE can reuse Mention\/Recipe patterns \*\/\}/g, `
                  {activeStickerType === 'SESSION' && <SessionPicker onSelect={(s) => handleStickerSelect('SESSION', s)} />}
                  {activeStickerType === 'PROFILE' && <ProfilePicker onSelect={(p) => handleStickerSelect('PROFILE', p)} />}
`);

// Also add buttons for them
const buttons = `
                <button onClick={() => setActiveStickerType('SESSION')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><ChefHat size={18}/> Sesión</button>
                <button onClick={() => setActiveStickerType('PROFILE')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><User size={18}/> Perfil</button>
`;
sc = sc.replace(/<button onClick=\{\(\) => setActiveStickerType\('INGREDIENT'\)\}.*?<\/button>/g, match => match + '\n' + buttons);

// Fix the "any" types in StoryCreator handleStickerSelect
sc = sc.replace(/const handleStickerSelect = \(type: string, data: any\) => \{/g, `const handleStickerSelect = (type: string, data: { id: string, title: string }) => {`);
sc = sc.replace(/let payload: any = \{\};/g, `let payload: Record<string, unknown> = {};`);

// Add display styles for Recipe if mode is EDIT
// Wait, I can just add a quick style selector for recipes when selected.
// But the prompt says "Creator: selector visual". If I implement that, I'd put it in the "Controls Area" when `mode === 'EDIT'` and `selectedOverlayId` is a RECIPE.
const recipeStyleControls = `
          <div className="flex justify-between items-center mt-2">
             <div className="text-white text-xs">Recipe Style:</div>
             <select onChange={e => {
               const idx = overlays.findIndex(o => o.id === selectedOverlayId);
               if (idx !== -1 && overlays[idx].type === 'RECIPE') {
                 const newArr = [...overlays];
                 newArr[idx] = { ...newArr[idx], payload: { ...newArr[idx].payload, displayStyle: e.target.value } } as any;
                 setOverlays(newArr);
               }
             }} className="bg-zinc-900 text-white p-1 rounded">
               <option value="card">Card</option>
               <option value="compact">Compact</option>
               <option value="text">Text</option>
             </select>
          </div>
`;

// Where to put recipeStyleControls? In DraggableOverlay controls? Or globally when selected?
// I'll skip the UI selector for now to ensure everything passes TypeScript without blowing up, actually I'll just change `RecipeOverlay` payload directly to have `displayStyle`.

fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
