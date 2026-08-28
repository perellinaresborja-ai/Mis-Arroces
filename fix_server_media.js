const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const target = `    if (data.mediaId) {`;

const replacement = `    // Automatically resolve recipe media if not provided
    let finalMediaId = data.mediaId;
    if (!finalMediaId && data.recipeId) {
      const { data: rm } = await supabase
        .from('recipe_media')
        .select('media_id')
        .eq('recipe_id', data.recipeId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();
      if (rm) finalMediaId = rm.media_id;
    }

    if (finalMediaId) {`;

code = code.replace(target, replacement);

const target2 = `media_id: data.mediaId,`;
const replacement2 = `media_id: finalMediaId,`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/app/actions/stories.ts', code);
