const fs = require('fs');

// 1. social.ts
let social = fs.readFileSync('src/app/actions/social.ts', 'utf8');
if (!social.includes('trackEvent')) {
  social = social.replace('import { createNotification', 'import { trackEvent } from "@/app/actions/analytics"\nimport { createNotification');
}
const followOld = `      await createNotification(
        targetUserId, 
        status === "PENDING" ? 'FOLLOW_REQUEST' : 'FOLLOW', 
        'profile', 
        user.id
      )
    }`;
const followNew = `      await createNotification(
        targetUserId, 
        status === "PENDING" ? 'FOLLOW_REQUEST' : 'FOLLOW', 
        'profile', 
        user.id
      )
      
      if (status === "ACCEPTED") {
        await trackEvent("FOLLOW", "PROFILE", targetUserId, targetUserId);
      }
    }`;
social = social.replace(followOld, followNew);
fs.writeFileSync('src/app/actions/social.ts', social, 'utf8');

// 2. sessions.ts
let sessions = fs.readFileSync('src/app/actions/sessions.ts', 'utf8');
if (!sessions.includes('trackEvent')) {
  sessions = sessions.replace('import { redirect', 'import { trackEvent } from "@/app/actions/analytics"\nimport { redirect');
}
const sessionOld = `  const { data: session, error } = await supabase.from("cooking_sessions").insert({
    recipe_id: recipeId,
    owner_id: user.id,
    rating: formData.get("rating") ? parseInt(formData.get("rating") as string) : null,
    socarrat_level: formData.get("socarrat") ? parseInt(formData.get("socarrat") as string) : null,
    notes: formData.get("notes") as string || null,
    date: new Date().toISOString()
  }).select().single()

  if (error) {`;
const sessionNew = `  const { data: session, error } = await supabase.from("cooking_sessions").insert({
    recipe_id: recipeId,
    owner_id: user.id,
    rating: formData.get("rating") ? parseInt(formData.get("rating") as string) : null,
    socarrat_level: formData.get("socarrat") ? parseInt(formData.get("socarrat") as string) : null,
    notes: formData.get("notes") as string || null,
    date: new Date().toISOString()
  }).select().single()

  if (error) {`;
// Wait, inserting the cook recipe track event requires the recipe owner ID!
const sessionNewComplete = `  const { data: session, error } = await supabase.from("cooking_sessions").insert({
    recipe_id: recipeId,
    owner_id: user.id,
    rating: formData.get("rating") ? parseInt(formData.get("rating") as string) : null,
    socarrat_level: formData.get("socarrat") ? parseInt(formData.get("socarrat") as string) : null,
    notes: formData.get("notes") as string || null,
    date: new Date().toISOString()
  }).select().single()

  if (!error) {
    try {
      const { data: rec } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single();
      if (rec?.owner_id) {
        await trackEvent("COOK_RECIPE", "RECIPE", recipeId, rec.owner_id);
      }
    } catch(e) {}
  }

  if (error) {`;
sessions = sessions.replace(sessionOld, sessionNewComplete);
fs.writeFileSync('src/app/actions/sessions.ts', sessions, 'utf8');

// 3. shopping.ts
let shopping = fs.readFileSync('src/app/actions/shopping.ts', 'utf8');
if (!shopping.includes('trackEvent')) {
  shopping = shopping.replace('import { revalidatePath', 'import { trackEvent } from "@/app/actions/analytics"\nimport { revalidatePath');
}
const shopOld = `  const { error: itemError } = await supabase.from("shopping_list_items").insert({
    list_id: list.id,
    recipe_id: recipeId,
    ingredient_name: ingredientName,
    quantity,
    unit_id: unitId
  })

  if (itemError) {`;
const shopNew = `  const { error: itemError } = await supabase.from("shopping_list_items").insert({
    list_id: list.id,
    recipe_id: recipeId,
    ingredient_name: ingredientName,
    quantity,
    unit_id: unitId
  })

  if (!itemError && recipeId) {
    try {
      const { data: rec } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single();
      if (rec?.owner_id && rec.owner_id !== user.id) {
        await trackEvent("ADD_TO_SHOPPING_LIST", "RECIPE", recipeId, rec.owner_id);
      }
    } catch(e) {}
  }

  if (itemError) {`;
shopping = shopping.replace(shopOld, shopNew);
fs.writeFileSync('src/app/actions/shopping.ts', shopping, 'utf8');
