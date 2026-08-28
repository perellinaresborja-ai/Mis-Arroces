const fs = require('fs');

let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// Replace the top imports to include createStory
if (!creator.includes('createStory')) {
  creator = creator.replace(
    /import \{ createClient \} from '@\/lib\/supabase\/client';/,
    `import { createClient } from '@/lib/supabase/client';\nimport { createStory } from '@/app/actions/stories';`
  );
}

const publishFunction = `
  const publish = async () => {
    let finalOverlays = [...overlays];
    if (drawings.length > 0) {
      finalOverlays.push({
        id: 'draw_'+Date.now(), type: 'DRAWING', x: 0, y: 0, scale: 1, rotation: 0, zIndex: finalOverlays.length,
        payload: { paths: drawings }
      });
    }

    try {
      await createStory({
        mediaTransform: transform,
        overlays: finalOverlays,
        background: background,
        caption: textVal || undefined, // or handled via overlay
        recipeId: initialRecipe?.id
      });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };
`;

creator = creator.replace(
  /const publish = async \(\) => \{[\s\S]*?router\.push\('\/'\);\n  \};/,
  publishFunction.trim()
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
