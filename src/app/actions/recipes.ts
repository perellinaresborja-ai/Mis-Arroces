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
    supabase.from("ingredients").select("id, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, nutrition_complete, default_grams_per_unit, ingredient_allergens(allergens(*)), ingredient_aliases(normalized_alias)"),
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

interface RecipeStepInput {
  id?: string;
  db_id?: string;
  instruction: string;
  duration_minutes?: string | number | null;
  notes?: string | null;
  media_id?: string | null;
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
      const existingStepIds = steps.filter((s: RecipeStepInput) => s.db_id).map((s: any) => s.db_id);
      
      if (existingStepIds.length > 0) {
        const { error: delError } = await supabase.from("recipe_steps")
          .delete()
          .eq("recipe_id", id)
          .not("id", "in", '(' + existingStepIds.join(',') + ')');
        if (delError) throw new Error("STEP DEL ERROR: " + delError.message);
      } else {
        await supabase.from("recipe_steps").delete().eq("recipe_id", id);
      }

      if (steps.length > 0) {
        const crypto = require('crypto');
        steps.forEach((s: RecipeStepInput) => {
          if (!s.db_id && !s.id) {
            s.id = crypto.randomUUID();
          }
        });

        // TEMPORARY PHASE: Shift step_numbers to avoid UNIQUE(recipe_id, step_number) collision during reorder
        const stepsToShift = steps.map((s: RecipeStepInput, idx: number) => ({
          id: s.db_id || s.id,
          recipe_id: id,
          step_number: idx + 10000,
          instruction: s.instruction,
          duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : null,
          notes: s.notes || undefined,
          media_id: s.media_id || undefined,
        }));
        
        const { error: shiftError } = await supabase.from("recipe_steps").upsert(stepsToShift);
        if (shiftError) throw new Error("STEP SHIFT ERROR: " + shiftError.message);

        // FINAL PHASE: Assign final step_numbers
        const stepsToUpsert = steps.map((s: RecipeStepInput, idx: number) => ({
          id: s.db_id || s.id,
          recipe_id: id,
          step_number: idx + 1,
          instruction: s.instruction,
          duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : null,
          notes: s.notes || undefined,
          media_id: s.media_id || undefined,
        }));
        const { error: stepUpsertError } = await supabase.from("recipe_steps").upsert(stepsToUpsert);
        if (stepUpsertError) throw new Error("STEP UPSERT ERROR: " + stepUpsertError.message);
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

      // Auto-growth queue for unmatched ingredients
      const unmatched = ingredients.filter((i: any) => !i.canonical_ingredient_id && i.display_text);
      if (unmatched.length > 0) {
        for (const u of unmatched) {
          const norm = u.display_text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');
          if (norm) {
            const { data: existing } = await supabase.from('unmatched_ingredients').select('id, frequency_count').eq('normalized_text', norm).maybeSingle();
            if (existing) {
              await supabase.from('unmatched_ingredients').update({ frequency_count: existing.frequency_count + 1, last_seen_at: new Date().toISOString() }).eq('id', existing.id);
            } else {
              await supabase.from('unmatched_ingredients').insert({ display_text: u.display_text, normalized_text: norm }).catch(() => {}); // ignore duplicates
            }
          }
        }
      }

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
    const v = (vessels && vessels.length > 0) ? vessels[0] : { vessel_type_id: vessel_type_id, diameter_cm: vessel_diameter_cm, notes: vessel_notes };
    if (v.vessel_type_id || v.diameter_cm || v.notes) {
      let finalVesselTypeId = v.vessel_type_id;
      if (!finalVesselTypeId) {
        const { data: defaultVessel } = await supabase.from("vessel_types").select("id").eq("name", "Paella").maybeSingle();
        finalVesselTypeId = defaultVessel?.id || null;
      }
      
      if (finalVesselTypeId) {
        const { error: vesselError } = await supabase.from("recipe_vessels").insert({
          recipe_id: id,
          vessel_type_id: finalVesselTypeId,
          diameter_cm: v.diameter_cm ? Number(v.diameter_cm) : null,
          notes: v.notes || null,
        });
        if (vesselError) console.error("Vessel insert error:", vesselError);
      }
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

  // Prevent cooking deleted recipes
  const { data: recipe } = await supabase.from("recipes").select("deleted_at").eq("id", recipeId).single();
  if (!recipe || recipe.deleted_at) throw new Error("Receta no disponible");

  if (wantToCook) {
    // To prevent duplicates if the unique constraint is missing, we delete first then insert
    await supabase.from('want_to_cook').delete().eq('recipe_id', recipeId).eq('user_id', session.user.id);
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
    const { data: recipe } = await supabase.from("recipes").select("owner_id, deleted_at").eq("id", recipeId).single();
    if (!recipe || recipe.deleted_at) throw new Error("Receta no disponible");

    await supabase.from('saves').insert({ recipe_id: recipeId, user_id: session.user.id });
    try {
      if (recipe.owner_id && recipe.owner_id !== session.user.id) {
        await trackEvent("SAVE", "RECIPE", recipeId, recipe.owner_id);
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

  // Verify ownership before modifying related records
  const { data: recipe } = await supabase.from('recipes').select('id').eq('id', recipeId).eq('owner_id', user.id).single();
  if (!recipe) throw new Error("Unauthorized or not found");

  // 1. Delete saves for this recipe across all users
  await supabase.from('saves').delete().eq('recipe_id', recipeId);
  
  // 2. Delete want_to_cook entries for this recipe
  await supabase.from('want_to_cook').delete().eq('recipe_id', recipeId);

  // 3. Soft delete the recipe (leaves cooking_sessions intact)
  const { error } = await supabase
    .from('recipes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', recipeId)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Delete recipe error:", error)
    throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/cookbook')
  revalidatePath(`/[userParam]`, 'layout')
}

export async function searchIngredientsAction(query: string) {
  if (!query || query.trim().length === 0) return []
  const supabase = await createClient()
  const cleanQ = query.trim().toLowerCase()

  // Search by canonical_name or normalized_name with limit 8
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, canonical_name, normalized_name')
    .or(`canonical_name.ilike.%${cleanQ}%,normalized_name.ilike.%${cleanQ}%`)
    .order('canonical_name')
    .limit(8)

  if (error) {
    console.error("searchIngredientsAction error:", error)
    return []
  }
  return data || []
}

export async function findRecipesByIngredientsAction(userIngredientIds: string[], onlyExact: boolean = false) {
  if (!userIngredientIds || userIngredientIds.length === 0) return []
  const supabase = await createClient()

  // 1. Try RPC find_recipes_by_ingredients
  try {
    const { data: rpcResults, error: rpcError } = await supabase.rpc('find_recipes_by_ingredients', {
      p_user_ingredient_ids: userIngredientIds,
      p_only_exact: onlyExact
    })

    if (!rpcError && rpcResults) {
      return rpcResults
    }
  } catch (err) {
    // RPC may not be available on remote before migration; proceed to SQL-like fallback below
  }

  // 2. High-performance fallback: select published recipes with ingredients
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      id,
      name,
      slug,
      scheduled_for,
      author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      recipe_media(is_primary, display_order, media:media_assets(storage_path)),
      variety:rice_varieties(name),
      style:rice_styles(name),
      recipe_ingredients(
        canonical_ingredient_id,
        display_text,
        ingredient:ingredients(id, canonical_name, normalized_name)
      )
    `)
    .eq('status', 'PUBLISHED')
    .is('deleted_at', null)

  if (error || !recipes) {
    console.error("findRecipesByIngredientsAction fallback error:", error)
    return []
  }

  const { isBasicIngredient } = await import('@/lib/matching')
  const userSet = new Set(userIngredientIds)
  const now = new Date()

  const results: any[] = []

  for (const r of recipes) {
    // Check scheduled_for: only publish if null or in the past
    if (r.scheduled_for && new Date(r.scheduled_for) > now) continue

    const allIngs = r.recipe_ingredients || []
    if (allIngs.length === 0) continue

    // Exclude verified basic pantry ingredients (salt, olive oil, water, peppers)
    const relevant = allIngs.filter((ri: any) => {
      const norm = ri.ingredient?.normalized_name || ri.display_text?.toLowerCase()
      return !isBasicIngredient(norm)
    })

    if (relevant.length === 0) continue

    const matchedNames: string[] = []
    const missingNames: string[] = []
    let matchedCount = 0

    for (const ri of relevant) {
      const ingId = ri.canonical_ingredient_id
      const displayName = ri.ingredient?.canonical_name || ri.display_text || 'Ingrediente'

      if (ingId && userSet.has(ingId)) {
        matchedCount++
        matchedNames.push(displayName)
      } else {
        missingNames.push(displayName)
      }
    }

    const totalRelevant = relevant.length
    const missingCount = missingNames.length
    const matchPct = Math.round((matchedCount / totalRelevant) * 100)

    // Check match criteria
    if (matchedCount === 0) continue

    if (onlyExact) {
      if (missingCount !== 0) continue
    } else {
      // Deterministic threshold:
      // (missingCount === 0) OR (matchPct >= 25%) OR (matchedCount >= 2)
      const passesThreshold = missingCount === 0 || matchPct >= 25 || matchedCount >= 2
      if (!passesThreshold) continue
    }

    // Determine primary cover image
    const sortedMedia = r.recipe_media ? [...r.recipe_media].sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.display_order || 0) - (b.display_order || 0)
    }) : []
    const coverImage = sortedMedia[0]?.media?.storage_path || null

    results.push({
      id: r.id,
      name: r.name,
      slug: r.slug,
      cover_image: coverImage,
      author: r.author ? {
        id: r.author.id,
        username: r.author.username,
        display_name: r.author.display_name,
        avatar_path: r.author.avatar?.storage_path || null
      } : null,
      variety_name: r.variety?.name || null,
      style_name: r.style?.name || null,
      total_relevant: totalRelevant,
      match_count: matchedCount,
      missing_count: missingCount,
      missing_ingredients: missingNames.sort((a, b) => a.localeCompare(b)),
      match_pct: matchPct
    })
  }

  // Strict deterministic ordering:
  // 1. missingCount ASC (fewer missing ingredients first)
  // 2. matchPct DESC (higher match percentage)
  // 3. matchCount DESC (more matched ingredients)
  // 4. name ASC (alphabetical stable tiebreaker)
  results.sort((a, b) => {
    if (a.missing_count !== b.missing_count) return a.missing_count - b.missing_count
    if (b.match_pct !== a.match_pct) return b.match_pct - a.match_pct
    if (b.match_count !== a.match_count) return b.match_count - a.match_count
    return a.name.localeCompare(b.name)
  })

  return results
}