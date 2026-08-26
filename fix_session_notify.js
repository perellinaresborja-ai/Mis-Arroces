const fs = require('fs');
let file = fs.readFileSync('src/app/actions/sessions.ts', 'utf8');

if (!file.includes('createNotification')) {
  file = file.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { createNotification } from "@/app/actions/notifications"'
  );
}

const replaceRegex = /if \(status === "PUBLISHED" && \!scheduledFor\) \{\n\s*revalidatePath\("\/"\)\n\s*\}/g;

file = file.replace(replaceRegex, `if (status === "PUBLISHED" && !scheduledFor) {
      revalidatePath("/")
      // Notify recipe owner if it's someone else's recipe
      const { data: recipeData } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single()
      if (recipeData?.owner_id && recipeData.owner_id !== user.id) {
        await createNotification(recipeData.owner_id, 'COOKED_RECIPE', 'session', id)
      }
    }`);
    
fs.writeFileSync('src/app/actions/sessions.ts', file, 'utf8');
