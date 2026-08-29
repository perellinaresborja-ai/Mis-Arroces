const fs = require('fs');

let pageCode = fs.readFileSync('src/app/create/story/page.tsx', 'utf8');

pageCode = pageCode.replace(
  /const \{ data: media \} = await supabase\.from\('recipe_media'\)\.select\('media_assets\(url\)'\)\.eq\('recipe_id', searchParams\.recipe_id\)\.order\('display_order', \{ascending: true\}\)\.limit\(1\)\.maybeSingle\(\);\n\s*recipeMedia = media \? \(media\?\.media_assets as \{ url: string \} \| null\) : null;/,
  `const { data: media } = await supabase.from('recipe_media').select('media_assets(storage_path)').eq('recipe_id', searchParams.recipe_id).order('display_order', {ascending: true}).limit(1).maybeSingle();
    
    if (media) {
      const ma = (media as unknown as { media_assets?: { storage_path: string } }).media_assets;
      if (ma) {
        recipeMedia = { url: supabase.storage.from('media').getPublicUrl(ma.storage_path).data.publicUrl };
      }
    }`
);

fs.writeFileSync('src/app/create/story/page.tsx', pageCode);
console.log('Fixed storage_path');
