const fs = require('fs');

function injectViewTracker(filePath, eventType, entityType, idVar, ownerVar) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('ViewTracker')) {
    content = content.replace(
      'export default async function',
      `import { ViewTracker } from "@/components/domain/ViewTracker"\nexport default async function`
    );
    
    // Inject right after the first layout div inside return
    const returnRegex = /return\s*\(\s*(<[A-Za-z]+[^>]*>)/;
    const match = content.match(returnRegex);
    if (match) {
      const trackerCode = `\n      {${ownerVar} && ${ownerVar} !== user?.id && <ViewTracker eventType="${eventType}" entityType="${entityType}" entityId={${idVar}} ownerId={${ownerVar}} />}`;
      content = content.replace(match[1], match[1] + trackerCode);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Injected in ' + filePath);
    }
  }
}

injectViewTracker('src/app/recipes/[id]/page.tsx', 'RECIPE_VIEW', 'RECIPE', 'recipe.id', 'recipe.owner_id');
injectViewTracker('src/app/sessions/[id]/page.tsx', 'SESSION_VIEW', 'SESSION', 'session.id', 'session.owner_id');
injectViewTracker('src/app/[userParam]/page.tsx', 'PROFILE_VIEW', 'PROFILE', 'profile.id', 'profile.id');

// For story link clicks:
let stories = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
if (!stories.includes('trackClickAction')) {
  stories = stories.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { trackClickAction } from "@/app/actions/tracking"');
  
  const linkOld = `<Link href={\`/recipes/\${currentStory.recipe.id}\`}`;
  const linkNew = `<Link href={\`/recipes/\${currentStory.recipe.id}\`} onClick={() => trackClickAction("STORY_LINK_CLICK", "STORY", currentStory.id, currentGroup.author.id)}`;
  
  if (stories.includes(linkOld)) {
    stories = stories.replace(linkOld, linkNew);
  } else {
    // If exact match fails, let's find the ver receta link
    const linkAlt = `href={\`/recipes/\${currentStory.recipe.id}\`}`;
    const linkAltNew = `href={\`/recipes/\${currentStory.recipe.id}\`} onClick={() => trackClickAction("STORY_LINK_CLICK", "STORY", currentStory.id, currentGroup.author.id)}`;
    stories = stories.replace(linkAlt, linkAltNew);
  }
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', stories, 'utf8');
  console.log('Injected Story link tracking');
}

// And for markStoryViewed:
let st = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
if (!st.includes('trackEvent("STORY_VIEW"')) {
  st = st.replace('import { revalidatePath } from "next/cache"', 'import { revalidatePath } from "next/cache"\nimport { trackEvent } from "@/app/actions/analytics"');
  const oldST = `await supabase.from("story_views").insert({ story_id: storyId, viewer_id: user.id })`;
  const newST = `await supabase.from("story_views").insert({ story_id: storyId, viewer_id: user.id })\n    await trackEvent("STORY_VIEW", "STORY", storyId, story.owner_id)`;
  st = st.replace(oldST, newST);
  fs.writeFileSync('src/app/actions/stories.ts', st, 'utf8');
}
