const fs = require('fs');
let content = fs.readFileSync('src/app/actions/recipes.ts', 'utf8');

if (!content.includes('import { trackEvent }')) {
  content = content.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath } from "next/cache"\nimport { trackEvent } from "@/app/actions/analytics"'
  );
}

const saveOld = `  if (saved) {
    await supabase.from('saves').insert({ recipe_id: recipeId, user_id: session.user.id });
  } else {`;

const saveNew = `  if (saved) {
    await supabase.from('saves').insert({ recipe_id: recipeId, user_id: session.user.id });
    try {
      const { data } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single();
      if (data?.owner_id && data.owner_id !== session.user.id) {
        await trackEvent("SAVE", "RECIPE", recipeId, data.owner_id);
      }
    } catch(e) {}
  } else {`;

if (content.includes(saveOld)) {
  content = content.replace(saveOld, saveNew);
} else {
    const saveOld2 = `    if (saved) {
      await supabase.from('saved_recipes').insert({ recipe_id: recipeId, user_id: session.user.id });
    } else {`;

    const saveNew2 = `    if (saved) {
      await supabase.from('saved_recipes').insert({ recipe_id: recipeId, user_id: session.user.id });
      try {
        const { data } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single();
        if (data?.owner_id && data.owner_id !== session.user.id) {
          await trackEvent("SAVE", "RECIPE", recipeId, data.owner_id);
        }
      } catch(e) {}
    } else {`;
    content = content.replace(saveOld2, saveNew2);
}

fs.writeFileSync('src/app/actions/recipes.ts', content, 'utf8');
