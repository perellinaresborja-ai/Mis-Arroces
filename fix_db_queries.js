const fs = require('fs');

let pageCode = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');

pageCode = pageCode.replace(
  /const \{ data \} = await supabase\.from\('recipes'\)\.select\('id, title'\)\.eq\('id', searchParams\.recipe_id\)\.single\(\);\n\s*recipeData = data;\n\s*const \{ data: media \} = await supabase\.from\('recipe_media'\)\.select\('url'\)\.eq\('recipe_id', searchParams\.recipe_id\)\.order\('position', \{ascending: true\}\)\.limit\(1\)\.maybeSingle\(\);\n\s*recipeMedia = media;/,
  `const { data } = await supabase.from('recipes').select('id, name').eq('id', searchParams.recipe_id).single();
    recipeData = data;
    const { data: media } = await supabase.from('recipe_media').select('media_assets(url)').eq('recipe_id', searchParams.recipe_id).order('display_order', {ascending: true}).limit(1).maybeSingle();
    recipeMedia = media ? (media as any).media_assets : null;`
);

pageCode = pageCode.replace(
  /recipeData\.title/,
  'recipeData.name'
);

fs.writeFileSync('src/app/create/story/page.tsx', pageCode);
console.log('Fixed DB queries in page.tsx');
