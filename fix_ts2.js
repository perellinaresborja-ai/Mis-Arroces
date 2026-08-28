const fs = require('fs');

let page = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');
page = page.replace(
  /initialRecipeId=\{recipe_id\} initialSessionId=\{session_id\}/,
  'initialRecipe={recipe_id ? { id: recipe_id, name: "Receta" } : undefined}'
);
fs.writeFileSync('src/app/create/story/page.tsx', page);

let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
creator = creator.replace(/background: JSON\.parse\(JSON\.stringify\(background\)\), setBackground/, 'background, setBackground');
creator = creator.replace(/background,/, 'background: JSON.parse(JSON.stringify(background)),');
creator = creator.replace(/setMode\(mode === 'DRAW' \? 'EDIT' : 'DRAW'\)/, 'setMode(mode === "DRAW" ? "EDIT" : "DRAW")');
// wait, the error is mode === 'DRAW' where mode is statically known? No, mode is a state string. The error says '"EDIT"' and '"DRAW"' have no overlap. This implies TypeScript narrowed mode to 'EDIT'. 
// It's in the JSX button: `onClick={() => setMode(mode === 'DRAW' ? 'EDIT' : 'DRAW')}`. But the button is inside `{mode === 'EDIT' && (...)}`, so TS knows mode is 'EDIT'!
// Therefore I should just do `onClick={() => setMode('DRAW')}`
creator = creator.replace(/onClick=\{\(\) => setMode\(mode === "DRAW" \? "EDIT" : "DRAW"\)\}/, 'onClick={() => setMode("DRAW")}');
creator = creator.replace(/onClick=\{\(\) => setMode\(mode === 'DRAW' \? 'EDIT' : 'DRAW'\)\}/, 'onClick={() => setMode("DRAW")}');

fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
