const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const oldUrlLogic = `  // Remove public fallback entirely. Story media is private.
  const fullUrl = mediaObj?.signed_url || "";`;

const newUrlLogic = `  const fullUrl = mediaObj?.signed_url || (mediaPath ? \`\${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/\${mediaPath}\` : "");`;

code = code.replace(oldUrlLogic, newUrlLogic);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
