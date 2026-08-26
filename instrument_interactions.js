const fs = require('fs');

let content = fs.readFileSync('src/app/actions/interactions.ts', 'utf8');

if (!content.includes('import { trackEvent }')) {
  content = content.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { trackEvent } from "@/app/actions/analytics"'
  );
}

// 1. Patch toggleLike
const likeOld = `  } else {
    if (entityType === "recipe") await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id })
  }`;

const likeNew = `  } else {
    if (entityType === "recipe") await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id })

    // Track like event
    try {
      let ownerId = null;
      if (entityType === "recipe") {
        const { data } = await supabase.from("recipes").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "session") {
        const { data } = await supabase.from("cooking_sessions").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "post") {
        const { data } = await supabase.from("posts").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "short") {
        const { data } = await supabase.from("shorts").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      }
      if (ownerId && ownerId !== user.id) {
        await trackEvent("PAELLA_LIKE", entityType.toUpperCase(), entityId, ownerId);
      }
    } catch(e) {}
  }`;

content = content.replace(likeOld, likeNew);

// 2. Patch createComment
const cmtOld = `  // Process mentions and hashtags
  await parseAndSaveMentionsAndHashtags(content, comment.id, entityType, supabase, user.id);

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }`;

const cmtNew = `  // Process mentions and hashtags
  await parseAndSaveMentionsAndHashtags(content, comment.id, entityType, supabase, user.id);

  // Track comment event
  try {
      let ownerId = null;
      if (entityType === "recipe") {
        const { data } = await supabase.from("recipes").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "session") {
        const { data } = await supabase.from("cooking_sessions").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "post") {
        const { data } = await supabase.from("posts").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      } else if (entityType === "short") {
        const { data } = await supabase.from("shorts").select("owner_id").eq("id", entityId).single();
        ownerId = data?.owner_id;
      }
      if (ownerId && ownerId !== user.id) {
        await trackEvent(parentId ? "REPLY" : "COMMENT", entityType.toUpperCase(), entityId, ownerId);
      }
  } catch(e) {}

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }`;

content = content.replace(cmtOld, cmtNew);
fs.writeFileSync('src/app/actions/interactions.ts', content, 'utf8');
