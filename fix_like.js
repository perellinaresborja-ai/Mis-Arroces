const fs = require('fs');

let file = fs.readFileSync('src/app/actions/interactions.ts', 'utf8');

// Add import
if (!file.includes('createNotification')) {
  file = file.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { createNotification } from "@/app/actions/notifications"'
  );
}

// Just find toggleLike precisely
const oldToggle = `export async function toggleLike(entityType: EntityType, entityId: string, isLiked: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (isLiked) {
    if (entityType === "recipe") await supabase.from("recipe_likes").delete().match({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").delete().match({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").delete().match({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").delete().match({ short_id: entityId, user_id: user.id })
  } else {
    if (entityType === "recipe") await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id })
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}`;

const newToggle = `export async function toggleLike(entityType: EntityType, entityId: string, isLiked: boolean, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let ownerId = null;

  if (isLiked) {
    if (entityType === "recipe") await supabase.from("recipe_likes").delete().match({ recipe_id: entityId, user_id: user.id })
    else if (entityType === "session") await supabase.from("session_likes").delete().match({ session_id: entityId, user_id: user.id })
    else if (entityType === "post") await supabase.from("post_likes").delete().match({ post_id: entityId, user_id: user.id })
    else if (entityType === "short") await supabase.from("short_likes").delete().match({ short_id: entityId, user_id: user.id })
  } else {
    if (entityType === "recipe") {
      await supabase.from("recipe_likes").insert({ recipe_id: entityId, user_id: user.id })
      const { data } = await supabase.from("recipes").select("owner_id").eq("id", entityId).single()
      ownerId = data?.owner_id
    } else if (entityType === "session") {
      await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
      const { data } = await supabase.from("cooking_sessions").select("user_id").eq("id", entityId).single()
      ownerId = data?.user_id
    } else if (entityType === "post") {
      await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
      const { data } = await supabase.from("social_posts").select("author_id").eq("id", entityId).single()
      ownerId = data?.author_id
    } else if (entityType === "short") {
      await supabase.from("short_likes").insert({ short_id: entityId, user_id: user.id })
      const { data } = await supabase.from("shorts").select("author_id").eq("id", entityId).single()
      ownerId = data?.author_id
    }
  }

  if (ownerId && !isLiked) {
    await createNotification(ownerId, 'LIKE', entityType, entityId);
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }
}`;

file = file.replace(oldToggle, newToggle);
fs.writeFileSync('src/app/actions/interactions.ts', file, 'utf8');
