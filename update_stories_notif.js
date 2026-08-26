const fs = require('fs');
const path = 'src/app/actions/stories.ts';
let content = fs.readFileSync(path, 'utf8');

const notifLogic = `  if (data.mediaId) {
    await supabase.from("story_media").insert({
      story_id: story.id,
      media_id: data.mediaId,
      display_order: 0
    })
  }

  // Handle MENTION notifications
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

  revalidatePath("/")`;

content = content.replace(/if \(data\.mediaId\) \{[\s\S]*?revalidatePath\("\/"\)/, notifLogic);
fs.writeFileSync(path, content, 'utf8');
