const fs = require('fs');
let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const regex = /if\s*\(finalMediaId\)\s*\{\s*await supabase\.from\("story_media"\)\.insert\(\{\s*story_id:\s*story\.id,\s*media_id:\s*finalMediaId,\s*display_order:\s*0\s*\}\)\s*\}/s;

const replacement = `if (finalMediaId) {
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
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/actions/stories.ts', code);
console.log("Replaced via regex!");
