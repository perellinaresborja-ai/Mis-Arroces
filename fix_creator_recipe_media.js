const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

const oldPublish = `      let mediaId: string | undefined;
      if (mediaFile) {
        mediaId = await uploadMedia(mediaFile, 'stories', Date.now().toString());
      }`;

const newPublish = `      let mediaId: string | undefined;
      if (mediaFile) {
        mediaId = await uploadMedia(mediaFile, 'stories', Date.now().toString());
      } else if (initialRecipeId) {
        const { data: rm } = await supabase.from('recipe_media').select('media_id').eq('recipe_id', initialRecipeId).order('display_order', {ascending: true}).limit(1).single();
        if (rm) mediaId = rm.media_id;
      }`;

code = code.replace(oldPublish, newPublish);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
