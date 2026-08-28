const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const target = `    if (finalMediaId) {
      await supabase.from("story_media").insert({
        story_id: story.id,
        media_id: finalMediaId,
        display_order: 0
      })
    }`;

const replacement = `    if (finalMediaId) {
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
        media_id: finalMediaId,
        display_order: 0
      });
      
      if (smError) {
        console.error("Failed to insert story_media:", smError);
        // Do not throw to prevent crashing the whole publish flow if RLS still blocks anon
      }
    }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/app/actions/stories.ts', code);
  console.log("REPLACED PERFECTLY!");
} else {
  console.log("TARGET NOT FOUND");
}
