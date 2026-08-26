const fs = require('fs');

let file = fs.readFileSync('src/app/actions/interactions.ts', 'utf8');

// Add import
if (!file.includes('createNotification')) {
  file = file.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { createNotification } from "@/app/actions/notifications"'
  );
}

// Modify toggleLike to fetch owner and notify
const likeRegex = /export async function toggleLike\([\s\S]*?\}\n/g;
let newFile = file.replace(likeRegex, (match) => {
  return `export async function toggleLike(entityType: EntityType, entityId: string, isLiked: boolean, pathToRevalidate?: string) {
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
    }
    else if (entityType === "session") {
      await supabase.from("session_likes").insert({ session_id: entityId, user_id: user.id })
      const { data } = await supabase.from("cooking_sessions").select("user_id").eq("id", entityId).single()
      ownerId = data?.user_id
    }
    else if (entityType === "post") {
      await supabase.from("post_likes").insert({ post_id: entityId, user_id: user.id })
      const { data } = await supabase.from("social_posts").select("author_id").eq("id", entityId).single()
      ownerId = data?.author_id
    }
    else if (entityType === "short") {
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
}
`;
});

// Modify createComment
const commentRegex = /export async function createComment\([\s\S]*?return res\n\}/;
newFile = newFile.replace(commentRegex, (match) => {
  return `export async function createComment(entityType: EntityType, entityId: string, content: string, parentId?: string, pathToRevalidate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let res;
  let ownerId = null;

  if (entityType === "recipe") {
    const { data, error } = await supabase.from("recipe_comments").insert({ recipe_id: entityId, author_id: user.id, content, parent_id: parentId }).select("*, author:profiles!recipe_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))").single()
    if (error) throw error
    res = data
    const { data: target } = await supabase.from("recipes").select("owner_id").eq("id", entityId).single()
    ownerId = target?.owner_id
  } else if (entityType === "session") {
    const { data, error } = await supabase.from("session_comments").insert({ session_id: entityId, author_id: user.id, content, parent_id: parentId }).select("*, author:profiles!session_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))").single()
    if (error) throw error
    res = data
    const { data: target } = await supabase.from("cooking_sessions").select("user_id").eq("id", entityId).single()
    ownerId = target?.user_id
  } else if (entityType === "post") {
    const { data, error } = await supabase.from("post_comments").insert({ post_id: entityId, author_id: user.id, content, parent_id: parentId }).select("*, author:profiles!post_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))").single()
    if (error) throw error
    res = data
    const { data: target } = await supabase.from("social_posts").select("author_id").eq("id", entityId).single()
    ownerId = target?.author_id
  } else if (entityType === "short") {
    const { data, error } = await supabase.from("short_comments").insert({ short_id: entityId, author_id: user.id, content, parent_id: parentId }).select("*, author:profiles!short_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))").single()
    if (error) throw error
    res = data
    const { data: target } = await supabase.from("shorts").select("author_id").eq("id", entityId).single()
    ownerId = target?.author_id
  }

  // Notificar al padre si es respuesta
  if (parentId) {
    let parentAuthorId = null;
    if (entityType === "recipe") {
      const { data } = await supabase.from("recipe_comments").select("author_id").eq("id", parentId).single()
      parentAuthorId = data?.author_id
    } else if (entityType === "session") {
      const { data } = await supabase.from("session_comments").select("author_id").eq("id", parentId).single()
      parentAuthorId = data?.author_id
    } else if (entityType === "post") {
      const { data } = await supabase.from("post_comments").select("author_id").eq("id", parentId).single()
      parentAuthorId = data?.author_id
    } else if (entityType === "short") {
      const { data } = await supabase.from("short_comments").select("author_id").eq("id", parentId).single()
      parentAuthorId = data?.author_id
    }
    
    if (parentAuthorId) {
      await createNotification(parentAuthorId, 'REPLY', entityType, entityId, { comment_id: res.id, text: content });
    }
  } else if (ownerId) {
    await createNotification(ownerId, 'COMMENT', entityType, entityId, { comment_id: res.id, text: content });
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate)
  }

  return res
}`;
});

fs.writeFileSync('src/app/actions/interactions.ts', newFile, 'utf8');
