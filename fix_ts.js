const fs = require('fs');

// 1. Fix page.tsx
let page = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');
page = page.replace(/initialRecipeId=\{recipe_id\} initialSessionId=\{session_id\}/, 'initialRecipe={recipe_id ? { id: recipe_id, name: "Recipe" } : undefined}');
fs.writeFileSync('src/app/create/story/page.tsx', page);

// 2. Fix Modal coverUrl
let modal = fs.readFileSync('src/components/domain/CreateHighlightModal.tsx', 'utf8');
modal = modal.replace(/coverUrl \?/g, 'coverUrl || undefined ?');
modal = modal.replace(/null/g, 'undefined'); // small hack to change the fallback
fs.writeFileSync('src/components/domain/CreateHighlightModal.tsx', modal);

// 3. Fix StoryCreator
let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
creator = creator.replace(/overlays: finalOverlays,/, 'overlays: JSON.parse(JSON.stringify(finalOverlays)),');
creator = creator.replace(/background,/, 'background: JSON.parse(JSON.stringify(background)),');
creator = creator.replace(/setIsDrawingMode\(\!isDrawingMode\)/, "setMode(mode === 'DRAW' ? 'EDIT' : 'DRAW')");
fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
