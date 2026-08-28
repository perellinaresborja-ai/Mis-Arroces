const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

const oldRecipeLoad = `      // Load initial recipe overlay if requested
      if (initialRecipeId && (!draft || draft.overlays.length === 0)) {
        supabase.from('recipes').select('id, name').eq('id', initialRecipeId).single().then(res => {
          if (res.data) {
            const newOverlay: StoryOverlay = {
              id: 'initial_recipe',
              type: 'RECIPE',
              x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: 0,
              payload: { recipeId: res.data.id, title: res.data.name }
            }
            setOverlays([newOverlay])
            pushState({ overlays: [newOverlay], transform, background })
          }
        })
      }`;

const newRecipeLoad = `      // Load initial recipe overlay if requested
      if (initialRecipeId && (!draft || draft.overlays.length === 0)) {
        supabase.from('recipes').select('id, name, recipe_media(media:media_assets(storage_path))').eq('id', initialRecipeId).single().then(res => {
          if (res.data) {
            const newOverlay: StoryOverlay = {
              id: 'initial_recipe',
              type: 'RECIPE',
              x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: 0,
              payload: { recipeId: res.data.id, title: res.data.name }
            }
            setOverlays([newOverlay])
            
            let currentMediaUrl = null;
            // Also load the recipe media as the main story media if not already set by draft
            if (!draft?.mediaFile && res.data.recipe_media?.[0]?.media?.storage_path) {
              currentMediaUrl = \`\${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/\${res.data.recipe_media[0].media.storage_path}\`;
              setMediaUrl(currentMediaUrl);
            }
            
            pushState({ overlays: [newOverlay], transform, background })
          }
        })
      }`;

code = code.replace(oldRecipeLoad, newRecipeLoad);
fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
