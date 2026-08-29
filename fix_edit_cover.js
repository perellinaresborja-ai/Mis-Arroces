const fs = require('fs');

let code = fs.readFileSync('src/components/domain/EditHighlightModal.tsx', 'utf8');

code = code.replace(
  /await supabase\.from\('story_highlights'\)\.update\(\{ name \}\)\.eq\('id', highlight\.id\)/,
  `const path = archivedStories.find(s => s.id === selectedIds[0])?.story_media?.[0]?.storage_path;
      const coverUrl = path ? ('https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/' + path) : undefined;
      await supabase.from('story_highlights').update({ name, cover_url: coverUrl || highlight.cover_url }).eq('id', highlight.id)`
);
// wait, highlight doesn't have cover_url in props. 
// { highlight: { id: string, name: string, stories?: { id: string }[] }
// I will just use `cover_url: coverUrl || null` wait, no, `coverUrl` is fine, we can just omit it if undefined.
// Or we can just use `cover_url: coverUrl` to ensure it always uses the first selected story as cover! This is simple and effective.

code = code.replace(
  /await supabase\.from\('story_highlights'\)\.update\(\{ name, cover_url: coverUrl \|\| highlight\.cover_url \}\)\.eq\('id', highlight\.id\)/,
  `// Re-replaced properly
      const updateData: any = { name };
      if (coverUrl) updateData.cover_url = coverUrl;
      await supabase.from('story_highlights').update(updateData).eq('id', highlight.id)`
);

fs.writeFileSync('src/components/domain/EditHighlightModal.tsx', code);
console.log('Fixed cover update in EditHighlightModal');
