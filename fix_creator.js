const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /import \{ createStory \} from '@\/app\/actions\/stories';/,
  `import { createStory } from '@/app/actions/stories';
import { globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, clearGlobalStoryDraft } from '@/lib/story-draft';`
);

code = code.replace(
  /const \[background, setBackground\] = useState<StoryBackground>\(\{ type: 'blur', value: '' \}\);/,
  `const [background, setBackground] = useState<StoryBackground>({ type: 'blur', value: '' });
  const [draftMediaUrl, setDraftMediaUrl] = useState<string | undefined>(initialMedia?.url);
  const [draftMediaType, setDraftMediaType] = useState<'IMAGE'|'VIDEO'|undefined>(initialMedia?.type);

  useEffect(() => {
    if (globalStoryDraftUrl && !initialMedia) {
      setDraftMediaUrl(globalStoryDraftUrl);
      setDraftMediaType(globalStoryDraftType || 'IMAGE');
      // Set mode to EDIT since we have media
      setMode('EDIT');
    } else if (!initialMedia && !initialRecipe) {
      // If there's no media and no recipe, default to TEXT mode
      setMode('TEXT');
    }
  }, []);
  
  // Important: We need a cleanup when unmounting to free memory if needed, 
  // but if we are publishing we might need it. Let's just keep it in memory for now until it's published or we leave.
  useEffect(() => {
    return () => {
      // We don't automatically clear here because they might be navigating to sticker pickers etc.
    };
  }, []);
  `
);

// We must replace `initialMedia?.url` with `draftMediaUrl` when passed to SharedStoryRenderer
code = code.replace(
  /mediaUrl=\{initialMedia\?\.url\}/,
  `mediaUrl={draftMediaUrl}`
);

// Replace "placeholder" upload with actual Supabase upload
code = code.replace(
  /mediaId: "placeholder", \/\/ In real flow, this is uploaded via MediaUploader first/,
  `mediaId: await uploadDraftIfNeeded(),`
);

// Add upload logic
code = code.replace(
  /const handlePublish = async \(\) => \{/,
  `const uploadDraftIfNeeded = async () => {
    if (globalStoryDraftFile) {
      const ext = globalStoryDraftFile.name.split('.').pop();
      const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${ext}\`;
      const { data, error } = await supabase.storage.from('media').upload(\`stories/\${fileName}\`, globalStoryDraftFile);
      if (error) { console.error(error); return null; }
      
      const { data: assetData, error: dbError } = await supabase.from('media_assets').insert({
        storage_path: data.path,
        media_type: globalStoryDraftType === 'VIDEO' ? 'VIDEO' : 'IMAGE'
      }).select().single();
      
      if (dbError) { console.error(dbError); return null; }
      return assetData.id;
    }
    return undefined;
  }

  const handlePublish = async () => {`
);

// Clear draft on publish
code = code.replace(
  /router\.push\('\/'\);\n\s*\} catch \(err\) \{/,
  `clearGlobalStoryDraft();
        router.push('/');
      } catch (err) {`
);


fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator.tsx draft handling');
