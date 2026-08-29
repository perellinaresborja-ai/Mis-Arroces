const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /const \{ data: assetData, error: dbError \} = await supabase\.from\('media_assets'\)\.insert\(\{\n\s*storage_path: data\.path,\n\s*media_type: globalStoryDraftType === 'VIDEO' \? 'VIDEO' : 'IMAGE'\n\s*\}\)\.select\(\)\.single\(\);/,
  `const { data: { user } } = await supabase.auth.getUser();
      if (!user) return undefined;
      const { data: assetData, error: dbError } = await supabase.from('media_assets').insert({
        storage_path: data.path,
        media_type: globalStoryDraftType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mime_type: globalStoryDraftFile.type,
        owner_id: user.id
      }).select().single();`
);

code = code.replace(
  /if \(error\) \{ console\.error\(error\); return null; \}/,
  `if (error) { console.error(error); return undefined; }`
);

code = code.replace(
  /if \(dbError\) \{ console\.error\(dbError\); return null; \}/,
  `if (dbError) { console.error(dbError); return undefined; }`
);

code = code.replace(
  /mediaId: await uploadDraftIfNeeded\(\),/,
  `mediaId: await uploadDraftIfNeeded() || undefined,`
);


fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator.tsx TS errors');
