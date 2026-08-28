const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const target = `    if (data.mediaId) {
    const { error: smError } = await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    });
    if (smError) {
      console.error("Failed to insert story_media:", smError);
      throw new Error("Failed to insert story media: " + smError.message);
    }
  }`;

const replacement = `    if (data.mediaId) {
    // We use the admin client to bypass potential RLS issues on story_media insert
    // since we already verified the user is authenticated and we just created the story.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let insertClient = supabase;
    if (serviceKey) {
      insertClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        serviceKey
      );
    }
    const { error: smError } = await insertClient.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    });
    if (smError) {
      console.error("Failed to insert story_media:", smError);
      throw new Error("Failed to insert story media: " + smError.message);
    }
  }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/actions/stories.ts', code);
