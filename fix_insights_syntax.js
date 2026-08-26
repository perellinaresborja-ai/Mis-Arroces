const fs = require('fs');
let file = fs.readFileSync('src/app/profile/insights/ProfileInsightsView.tsx', 'utf8');

file = file.replace(
  /src=\{\`\\\$\{process.env.NEXT_PUBLIC_SUPABASE_URL\}\/storage\/v1\/object\/public\/recipe_media\/\\\$\{item.recipe.primary_media_id.storage_path\}\`\}/g,
  'src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${item.recipe.primary_media_id.storage_path}`}'
);

file = file.replace(
  /Cocinada \\\$\{item.count\} veces/g,
  'Cocinada ${item.count} veces'
);

file = file.replace(
  /Guardada \\\$\{item.count\} veces/g,
  'Guardada ${item.count} veces'
);

file = file.replace(
  /Vista \\\$\{item.count\} veces/g,
  'Vista ${item.count} veces'
);

file = file.replace(
  /href=\{item.entity_type === 'recipe' \? \\\`\/recipes\/\\\$\{item.entity_id\}\\\` \: '#'\}/g,
  "href={item.entity_type === 'recipe' ? `/recipes/${item.entity_id}` : '#'}"
);

fs.writeFileSync('src/app/profile/insights/ProfileInsightsView.tsx', file, 'utf8');
