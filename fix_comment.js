const fs = require('fs');

let file = fs.readFileSync('src/app/actions/interactions.ts', 'utf8');

const regex = /    if \(pathToRevalidate\) \{\n      revalidatePath\(pathToRevalidate\)\n    \}\n    return insertedComment\n\}/;

const newBlock = `
    let ownerId = null;
    if (entityType === "recipe") {
      const { data } = await supabase.from("recipes").select("owner_id").eq("id", entityId).single()
      ownerId = data?.owner_id
    } else if (entityType === "session") {
      const { data } = await supabase.from("cooking_sessions").select("user_id").eq("id", entityId).single()
      ownerId = data?.user_id
    } else if (entityType === "post") {
      const { data } = await supabase.from("social_posts").select("author_id").eq("id", entityId).single()
      ownerId = data?.author_id
    } else if (entityType === "short") {
      const { data } = await supabase.from("shorts").select("author_id").eq("id", entityId).single()
      ownerId = data?.author_id
    }

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
      if (parentAuthorId) await createNotification(parentAuthorId, 'REPLY', entityType, entityId, { comment_id: insertedComment.id, text: trimmedContent });
    } else if (ownerId) {
      await createNotification(ownerId, 'COMMENT', entityType, entityId, { comment_id: insertedComment.id, text: trimmedContent });
    }

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate)
    }
    return insertedComment
}`;

file = file.replace(regex, newBlock);
fs.writeFileSync('src/app/actions/interactions.ts', file, 'utf8');
