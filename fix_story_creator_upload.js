const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('import { uploadMedia }')) {
  code = code.replace(
    'import { createStory } from "@/app/actions/stories"',
    'import { createStory } from "@/app/actions/stories"\nimport { uploadMedia } from "@/services/media/client"'
  );
}

const oldPublish = `  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      await createStory({
        mediaTransform: transform,
        overlays,
        background,
        recipeId: initialRecipeId,
        sessionId: initialSessionId
      })`;

const newPublish = `  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      
      let mediaId: string | undefined;
      if (mediaFile) {
        mediaId = await uploadMedia(mediaFile, 'stories', Date.now().toString());
      }

      await createStory({
        mediaTransform: transform,
        overlays,
        background,
        recipeId: initialRecipeId,
        sessionId: initialSessionId,
        mediaId
      })`;

code = code.replace(oldPublish, newPublish);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
