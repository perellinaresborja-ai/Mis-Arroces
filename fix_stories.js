const fs = require('fs');
let content = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

// Replace the insertClient block
const badBlock = `      if (finalMediaId) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let insertClient = supabase;
      if (serviceKey) {
        insertClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          serviceKey
        );
      }
      
      const { error: smError } = await insertClient.from("story_media").insert({`;

const goodBlock = `      if (finalMediaId) {
      const { error: smError } = await supabase.from("story_media").insert({`;

content = content.replace(badBlock, goodBlock);

fs.writeFileSync('src/app/actions/stories.ts', content);
