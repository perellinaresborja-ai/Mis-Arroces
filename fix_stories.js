const fs = require('fs');

let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

// We need to move the validation BEFORE the insert.
// We'll replace the whole createStory function body.
let createStoryMatch = code.match(/export async function createStory\([\s\S]*?\)\s*\{([\s\S]*?)revalidatePath\("\/"\)\n\s*return story\n\}/);

let newCreateStory = `export async function createStory(data: {
  mediaTransform?: any
  overlays?: any[]
  background?: any
  mediaId?: string
  caption?: string
  recipeId?: string
  sessionId?: string
}) {
  const { createClient } = await import("@/lib/supabase/server")
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let finalMediaId = data.mediaId;

  // 1. Determine finalMediaId if not provided but recipeId is provided
  if (!finalMediaId && data.recipeId) {
    const { data: recipe } = await supabase.from('recipes').select('visibility').eq('id', data.recipeId).single();
    if (recipe && (recipe.visibility === 'PUBLIC' || recipe.visibility === 'FOLLOWERS')) {
      const { data: rm } = await supabase
        .from('recipe_media')
        .select('media_id')
        .eq('recipe_id', data.recipeId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();
      if (rm) finalMediaId = rm.media_id;
    }
  }

  // 2. Validate media access BEFORE inserting story
  if (finalMediaId) {
    const { data: ma } = await supabase.from('media_assets').select('owner_id').eq('id', finalMediaId).single();
    // Allow if they own the media
    let allowed = ma && ma.owner_id === user.id;
    
    // Or allow if the media belongs to a public recipe that they are sharing
    if (!allowed && data.recipeId) {
      const { data: rm } = await supabase.from('recipe_media').select('recipe_id').eq('media_id', finalMediaId).limit(1).single();
      if (rm && rm.recipe_id === data.recipeId) {
        allowed = true; // It's a recipe they are legally sharing
      }
    }
    
    // Or allow if the media belongs to a public session
    if (!allowed && data.sessionId) {
      const { data: sm } = await supabase.from('session_media').select('session_id').eq('media_id', finalMediaId).limit(1).single();
      if (sm && sm.session_id === data.sessionId) {
        allowed = true;
      }
    }

    if (!allowed) {
      throw new Error("Unauthorized: You do not own or have access to share this media asset.");
    }
  }

  // 3. Insert Story
  const { data: story, error } = await supabase.from("stories").insert({
    owner_id: user.id,
    caption: data.caption || null,
    recipe_id: data.recipeId || null,
    session_id: data.sessionId || null,
    visibility: "PUBLIC",
    media_transform: data.mediaTransform || null,
    overlays: data.overlays || [],
    background: data.background || null
  }).select().single()

  if (error || !story) {
    console.error("Error creating story:", error)
    throw new Error("Failed to create story")
  }

  // 4. Insert story_media
  if (finalMediaId) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let insertClient = supabase;
    if (serviceKey) {
      insertClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        serviceKey
      );
    }
    
    const { error: smError } = await insertClient.from("story_media").insert({
      story_id: story.id,
      media_id: finalMediaId,
      display_order: 0
    });
    
    if (smError) {
      console.error("Failed to insert story_media:", smError);
      // Clean up the orphaned story
      await insertClient.from("stories").delete().eq("id", story.id);
      throw new Error("Failed to attach media to story. Story creation aborted.");
    }
  }

  // 5. Handle MENTION notifications
  if (data.overlays && Array.isArray(data.overlays)) {
    const { createNotification } = await import("@/app/actions/notifications");
    const mentionedIds = new Set<string>();
    
    for (const overlay of data.overlays) {
      if (overlay.type === 'MENTION' && overlay.payload?.userId) {
        mentionedIds.add(overlay.payload.userId);
      }
    }
    
    for (const recipientId of mentionedIds) {
      if (recipientId !== user.id) {
        await createNotification(recipientId, 'MENTION', 'story', story.id);
      }
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/")
  return story
}`;

code = code.replace(/export async function createStory\([\s\S]*?revalidatePath\("\/"\)\n\s*return story\n\}/, newCreateStory);

fs.writeFileSync('src/app/actions/stories.ts', code);
console.log("FIXED STORIES ACTION");
