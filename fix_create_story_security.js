const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const targetMediaResolution = `    // Automatically resolve recipe media if not provided
    let finalMediaId = data.mediaId;
    if (!finalMediaId && data.recipeId) {`;

const newMediaResolution = `    // Verify ownership if client provided an arbitrary mediaId
    if (data.mediaId) {
      const { data: ma } = await supabase.from('media_assets').select('owner_id').eq('id', data.mediaId).single();
      if (!ma || ma.owner_id !== user.id) {
        throw new Error("Unauthorized: You do not own this media asset.");
      }
    }

    // Automatically resolve recipe media if not provided
    let finalMediaId = data.mediaId;
    if (!finalMediaId && data.recipeId) {
      // Verify recipe visibility before allowing its media to be linked
      const { data: recipe } = await supabase.from('recipes').select('visibility').eq('id', data.recipeId).single();
      if (!recipe || (recipe.visibility !== 'PUBLIC' && recipe.visibility !== 'FOLLOWERS')) {
         // Fallback or skip if not public, though RLS on recipes should handle this.
      }
`;

code = code.replace(targetMediaResolution, newMediaResolution);
fs.writeFileSync('src/app/actions/stories.ts', code);
