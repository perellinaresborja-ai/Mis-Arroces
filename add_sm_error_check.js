const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

code = code.replace(
  `    if (data.mediaId) {
    await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    })
  }`,
  `    if (data.mediaId) {
    const { error: smError } = await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    });
    if (smError) {
      console.error("Failed to insert story_media:", smError);
      throw new Error("Failed to insert story media: " + smError.message);
    }
  }`
);

fs.writeFileSync('src/app/actions/stories.ts', code);
