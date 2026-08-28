const fs = require('fs');

let sp = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');
// Fix subtitle null error
sp = sp.replace(/subtitle: u\.display_name,/g, 'subtitle: u.display_name || undefined,');
sp = sp.replace(/avatarUrl: \(\(\(u\.media as unknown\) as \{ storage_path\?: string \}\)\?\.storage_path \? `https:\/\/zvesoygqssyyojqyswwm\.supabase\.co\/storage\/v1\/object\/public\/recipe_media\/\$\{\(\(u\.media as unknown\) as \{ storage_path\?: string \}\)\.storage_path\}` : null\)/g, 
  "avatarUrl: (((u.media as unknown) as { storage_path?: string })?.storage_path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${((u.media as unknown) as { storage_path?: string }).storage_path}` : undefined)");
// Replace all nulls with undefined in the pickers mappings to satisfy TS
sp = sp.replace(/null\)\}/g, "undefined)}");
sp = sp.replace(/null\)\}/g, "undefined)}");
sp = sp.replace(/: null/g, ": undefined");
fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', sp);


let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
sc = sc.replace(/let payload: Record<string, unknown> = \{\};/g, '');
sc = sc.replace(/if \(type === 'MENTION'\) payload = \{ username: data\.title, userId: data\.id \};[\s\S]*?setActiveStickerType\(null\);/g, `
    let newOverlay: StoryOverlay | null = null;
    const common = { id: type+'_'+Date.now(), x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length + 10 };
    if (type === 'MENTION') newOverlay = { ...common, type: 'MENTION', payload: { username: data.title, userId: data.id } };
    if (type === 'LOCATION') newOverlay = { ...common, type: 'LOCATION', payload: { name: data.title } };
    if (type === 'RECIPE') newOverlay = { ...common, type: 'RECIPE', payload: { title: data.title, recipeId: data.id } };
    if (type === 'INGREDIENT') newOverlay = { ...common, type: 'INGREDIENT', payload: { name: data.title, ingredientId: data.id } };
    if (type === 'SESSION') newOverlay = { ...common, type: 'SESSION', payload: { authorName: data.title, sessionId: data.id } };
    if (type === 'PROFILE') newOverlay = { ...common, type: 'PROFILE', payload: { username: data.title, userId: data.id } };
    
    if (newOverlay) {
      setOverlays([...overlays, newOverlay]);
    }
    setActiveStickerType(null);
`);
fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
