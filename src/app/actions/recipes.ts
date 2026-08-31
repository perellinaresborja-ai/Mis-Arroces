// @ts-nocheck
"use server"

import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createQuickRecipe(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
  const timestamp = Date.now()
  const finalSlug = `${slug}-${timestamp}` // Ensure unique slug

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      owner_id: user.id,
      name,
      slug: finalSlug,
      status: "DRAFT",
    })
    .select()
    .single()

  if (recipeError || !recipe) {
    console.error(recipeError)
    throw new Error("Failed to create recipe")
  }

  // Handle image if provided via a hidden field containing the media asset ID
  const mediaAssetId = formData.get("media_asset_id") as string
  if (mediaAssetId) {
    await supabase.from("recipe_media").insert({
      recipe_id: recipe.id,
      media_id: mediaAssetId,
      is_primary: true,
      display_order: 0,
    })
  }

  revalidatePath("/cookbook")
  redirect(`/recipes/${recipe.id}/edit`)
}

export async function getCatalogs() {
  const supabase = await createClient()
  
  const [styles, varieties, vessels, heats, units, ingredients] = await Promise.all([
    supabase.from("rice_styles").select("*"),
    supabase.from("rice_varieties").select("*"),
    supabase.from("vessel_types").select("*"),
    supabase.from("heat_sources").select("*"),
    supabase.from("units").select("*"),
    supabase.from("ingredients").select("id, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, nutrition_complete, default_grams_per_unit, ingredient_allergens(allergens(*))"),
  ])

  return {
    styles: styles.data || [],
    varieties: varieties.data || [],
    vessels: vessels.data || [],
    heats: heats.data || [],
    units: units.data || [],
    ingredients: ingredients?.data || [],
  }
}

export async function updateRecipeStatus(id: string, status: string, scheduledFor?: string | null) {
  const { createClient } = require("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth");
  await supabase.from("recipes").update({ status, scheduled_for: scheduledFor }).eq("id", id).eq("owner_id", user.id);
  const { revalidatePath } = require("next/cache");
  const { redirect } = require("next/navigation");
  
  revalidatePath("/recipes/" + id);
  revalidatePath("/recipes/" + id + "/edit");
  revalidatePath("/cookbook");
  revalidatePath("/");

  redirect("/recipes/" + id);
}

export async function updateRecipeFull(id: string, data: any) {
  const { createClient } = require("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth");
  
  const { steps, ingredients, vessels, media_ids, tags, vessel_type_id, vessel_diameter_cm, vessel_notes, ...rawBaseData } = data;
  
  // Clean empty strings to null for postgres
  const baseData = { ...rawBaseData };
  if (baseData.base_servings === null || baseData.base_servings === "") baseData.base_servings = 1;
  for (const key of Object.keys(baseData)) {
    if (baseData[key] === '') baseData[key] = null;
  }
  
  const { data: updatedRecipe, error: recipeError } = await supabase
    .from("recipes")
    .update(baseData)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (recipeError) {
    throw new Error("Error actualizando receta: " + recipeError.message);
  }

  if (!updatedRecipe) {
    throw new Error("La receta no se ha actualizado. No existe o no pertenece al usuario autenticado.");
  }

  if (steps) {
    await supabase.from("recipe_steps").delete().eq("recipe_id", id);
    if (steps.length > 0) {
      const stepsToInsert = steps.map((s: any, idx: number) => ({
        recipe_id: id,
        step_number: idx + 1,
        instruction: s.instruction,
        duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : null,
        notes: s.notes || undefined,
        media_id: s.media_id || undefined,
      }));
      const { error: stepInsertError } = await supabase.from("recipe_steps").insert(stepsToInsert);
      if (stepInsertError) throw new Error("STEP INSERT ERROR: " + stepInsertError.message);
    }
  }

  if (ingredients) {
    const existingIngIds = ingredients.filter((i: any) => i.db_id).map((i: any) => i.db_id);
    
    // Delete ingredients that are no longer in the list
    if (existingIngIds.length > 0) {
      const { error: delError } = await supabase.from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id)
        .not("id", "in", '(' + existingIngIds.join(',') + ')');
      if (delError) throw new Error("ING DEL ERROR: " + delError.message);
    } else {
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    }

    if (ingredients.length > 0) {
      // Generate IDs for new ingredients so we can link costs
      const crypto = require('crypto');
      ingredients.forEach((i) => {
        if (!i.db_id && !i.id) {
          i.id = crypto.randomUUID();
        }
      });
      
      const ingsToUpsert = ingredients.map((i: any, idx: number) => ({
        id: i.db_id || i.id || undefined,
        recipe_id: id,
        display_order: idx + 1,
        display_text: i.display_text,
        normalized_quantity: i.normalized_quantity ? Number(i.normalized_quantity) : null,
        unit_id: i.unit_id || null,
        canonical_ingredient_id: i.canonical_ingredient_id || null,
      }));
      
      const { error: ingError } = await supabase.from("recipe_ingredients").upsert(ingsToUpsert);
      if (ingError) throw new Error("ING UPSERT ERROR: " + ingError.message);

      // Now save costs
      const costsToUpsert = ingredients
          .filter((i: any) => i.costData && (i.costData.purchase_amount || i.costData.purchase_price))
          .map((i: any) => ({
            id: i.db_id || i.id, // the ID used in ingsToUpsert
            recipe_id: id,
            owner_id: user.id,
            purchase_amount: i.costData.purchase_amount ? Number(i.costData.purchase_amount) : null,
            purchase_unit_id: i.costData.purchase_unit_id || null,
            purchase_price: i.costData.purchase_price ? Number(i.costData.purchase_price) : null
          }));
      
      if (costsToUpsert.length > 0) {
        const { error: costError } = await supabase.from("recipe_ingredient_costs").upsert(costsToUpsert);
        if (costError) throw new Error("COST UPSERT ERROR: " + costError.message);
      }
    }
  }

  // Handle vessels either as array or flat fields
  const hasFlatVessel = vessel_type_id || vessel_diameter_cm || vessel_notes;
  if ((vessels && vessels.length > 0) || hasFlatVessel) {
    await supabase.from("recipe_vessels").delete().eq("recipe_id", id);
    const v = (vessels && vessels.length > 0) ? vessels[0] : { type_id: vessel_type_id, diameter_cm: vessel_diameter_cm, notes: vessel_notes };
    if (v.type_id || v.diameter_cm || v.notes) {
      await supabase.from("recipe_vessels").insert({
        recipe_id: id,
        type_id: v.type_id || null,
        diameter_cm: v.diameter_cm ? Number(v.diameter_cm) : null,
        notes: v.notes || null,
      });
    }
  }

  if (tags) {
    await supabase.from("recipe_tags").delete().eq("recipe_id", id);
    if (tags.length > 0) {
      const tagsToInsert = tags.map((tid: string) => ({
        recipe_id: id,
        tag_id: tid
      }));
      await supabase.from("recipe_tags").insert(tagsToInsert);
    }
  }

  if (media_ids) {
    await supabase.from("recipe_media").delete().eq("recipe_id", id);
    if (media_ids.length > 0) {
      const mediasToInsert = media_ids.map((mid: string, idx: number) => ({
        recipe_id: id,
        media_id: mid,
        display_order: idx + 1,
        is_primary: idx === 0
      }));
      const { error: insertError } = await supabase.from("recipe_media").insert(mediasToInsert);
      if (insertError) throw new Error("MEDIA INSERT ERROR: " + insertError.message);
    }
  }

  const { revalidatePath } = require("next/cache");
  const { redirect } = require("next/navigation");
  
  revalidatePath("/recipes/" + id);
  revalidatePath("/recipes/" + id + "/edit");
  revalidatePath("/cookbook");
  revalidatePath("/");

  redirect("/recipes/" + id);
}

export async function toggleWantToCook(recipeId: string, wantToCook: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");

  if (wantToCook) {
    await supabase.from('want_to_cook').insert({ recipe_id: recipeId, user_id: session.user.id });
  } else {
    await supabase.from('want_to_cook').delete().eq('recipe_id', recipeId).eq('user_id', session.user.id);
  }
  revalidatePath('/recipes/' + recipeId);
  revalidatePath('/cookbook');
}

export async function toggleSaveRecipe(recipeId: string, saved: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");

  if (saved) {
    await supabase.from('saves').insert({ recipe_id: recipeId, user_id: session.user.id });
    try {
      const { data } = await supabase.from("recipes").select("owner_id").eq("id", recipeId).single();
      if (data?.owner_id && data.owner_id !== session.user.id) {
        await trackEvent("SAVE", "RECIPE", recipeId, data.owner_id);
      }
    } catch(e) {}
  } else {
    await supabase.from('saves').delete().eq('recipe_id', recipeId).eq('user_id', session.user.id);
  }
  revalidatePath('/recipes/' + recipeId);
  revalidatePath('/cookbook');
}


export async function deleteRecipe(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Delete recipe error:", error)
    throw new Error(error.message)
  }
}