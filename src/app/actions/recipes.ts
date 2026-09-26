// @ts-nocheck
"use server"

import { revalidatePath } from "next/cache"
import { trackEvent } from "@/app/actions/analytics"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { processFounderSpotAndEmail } from "@/lib/founder-claim"

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
    supabase.from("rice_varieties").select("*").order("name"),
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

  // Validate integrity when publishing
  if (status === 'PUBLISHED') {
    const { data: rec, error: recError } = await supabase
      .from("recipes")
      .select("name, base_servings, rice_qty, stock_qty, stock_ingredient_id, recipe_ingredients(display_text, normalized_quantity, unit_id), recipe_steps(instruction, duration_minutes, notes)")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (recError || !rec) {
      throw new Error("No se ha podido cargar la receta para verificar su integridad.");
    }

    const { validateRecipeForPublishing } = require("@/lib/recipe-validator");
    const validation = validateRecipeForPublishing({
      name: rec.name,
      base_servings: rec.base_servings,
      rice_qty: rec.rice_qty,
      stock_qty: rec.stock_qty,
      stock_ingredient_id: rec.stock_ingredient_id,
      ingredients: rec.recipe_ingredients,
      steps: rec.recipe_steps,
    });

    if (!validation.isValid) {
      throw new Error("No se puede publicar la receta: " + validation.errorList.join(" "));
    }
  }

  await supabase.from("recipes").update({ status, scheduled_for: scheduledFor }).eq("id", id).eq("owner_id", user.id);

  if (status === 'PUBLISHED') {
    await processFounderSpotAndEmail(user.id, user.email);
  }

  const { revalidatePath } = require("next/cache");
  const { redirect } = require("next/navigation");
  
  revalidatePath("/recipes/" + id);
  revalidatePath("/recipes/" + id + "/edit");
  revalidatePath("/cookbook");
  revalidatePath("/");

  if (!skipRedirect) { redirect("/recipes/" + id); }
}

interface RecipeStepInput {
  id?: string;
  db_id?: string;
  instruction: string;
  duration_minutes?: string | number | null;
  notes?: string | null;
  media_id?: string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateRecipeFull(id: string, data: any, skipRedirect: boolean = false, customSupabase?: any) {
  try {
    const supabase = customSupabase || (await (require("@/lib/supabase/server").createClient)());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión para editar recetas." };
    }
    
    const { steps, ingredients, vessels, media_ids, tags, vessel_type_id, vessel_diameter_cm, vessel_notes, ...rawBaseData } = data;
    
    // Clean empty strings and sanitize data types for postgres
    const baseData = { ...rawBaseData };
    
    // Numbers
    baseData.base_servings = baseData.base_servings !== "" && baseData.base_servings != null ? Number(baseData.base_servings) : 1;
    baseData.rice_qty = baseData.rice_qty !== "" && baseData.rice_qty != null ? Number(baseData.rice_qty) : null;
    baseData.stock_qty = baseData.stock_qty !== "" && baseData.stock_qty != null ? Number(baseData.stock_qty) : null;
    baseData.cook_time = baseData.cook_time !== "" && baseData.cook_time != null ? Number(baseData.cook_time) : null;
    baseData.rest_time = baseData.rest_time !== "" && baseData.rest_time != null ? Number(baseData.rest_time) : null;

    // UUID foreign keys: if not valid UUID, null
    const uuidFields = ['style_id', 'variety_id', 'heat_source_id', 'stock_ingredient_id'];
    for (const uf of uuidFields) {
      if (baseData[uf] && !UUID_REGEX.test(baseData[uf])) {
        baseData[uf] = null;
      }
    }

    // Clean remaining empty strings to null
    for (const key of Object.keys(baseData)) {
      if (baseData[key] === '') baseData[key] = null;
    }

    // Validate integrity when publishing or keeping as published
    if (baseData.status === 'PUBLISHED') {
      const { validateRecipeForPublishing } = require("@/lib/recipe-validator");
      const validation = validateRecipeForPublishing({
        name: baseData.name,
        base_servings: baseData.base_servings,
        rice_qty: baseData.rice_qty,
        stock_qty: baseData.stock_qty,
        stock_ingredient_id: baseData.stock_ingredient_id,
        ingredients: ingredients,
        steps: steps,
      });

      if (!validation.isValid) {
        return {
          success: false,
          isValidation: true,
          error: "No se puede guardar como publicada: " + validation.errorList.join(" "),
          errorList: validation.errorList,
        };
      }
    }
    
    const { data: updatedRecipe, error: recipeError } = await supabase
      .from("recipes")
      .update(baseData)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();

    if (recipeError) {
      console.error("Error actualizando receta en Supabase:", recipeError);
      return { success: false, error: "Error actualizando receta: " + recipeError.message };
    }

    if (!updatedRecipe) {
      return { success: false, error: "La receta no se ha actualizado. No existe o no pertenece al usuario autenticado." };
    }

    // STEPS
    if (steps) {
      const crypto = require('crypto');
      // Assign resolved UUIDs to every step
      steps.forEach((s: any) => {
        if (s.db_id && UUID_REGEX.test(s.db_id)) {
          s.resolvedId = s.db_id;
        } else if (s.id && UUID_REGEX.test(s.id)) {
          s.resolvedId = s.id;
        } else {
          s.resolvedId = crypto.randomUUID();
        }
      });

      const existingStepIds = steps
        .map((s: any) => (s.db_id && UUID_REGEX.test(s.db_id)) ? s.db_id : (s.id && UUID_REGEX.test(s.id)) ? s.id : null)
        .filter(Boolean) as string[];
      
      if (existingStepIds.length > 0) {
        const { error: delError } = await supabase.from("recipe_steps")
          .delete()
          .eq("recipe_id", id)
          .not("id", "in", '(' + existingStepIds.join(',') + ')');
        if (delError) console.error("STEP DEL ERROR:", delError);
      } else {
        await supabase.from("recipe_steps").delete().eq("recipe_id", id);
      }

      if (steps.length > 0) {
        // Phase 1: Shift to avoid unique constraint collision
        const stepsToShift = steps.map((s: any, idx: number) => ({
          id: s.resolvedId,
          recipe_id: id,
          step_number: idx + 10000,
          instruction: s.instruction || "",
          duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : null,
          notes: s.notes || null,
          media_id: (s.media_id && UUID_REGEX.test(s.media_id)) ? s.media_id : null,
        }));
        
        const { error: shiftError } = await supabase.from("recipe_steps").upsert(stepsToShift);
        if (shiftError) console.error("STEP SHIFT ERROR:", shiftError);

        // Phase 2: Final renumbering
        const stepsToUpsert = steps.map((s: any, idx: number) => ({
          id: s.resolvedId,
          recipe_id: id,
          step_number: idx + 1,
          instruction: s.instruction || "",
          duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : null,
          notes: s.notes || null,
          media_id: (s.media_id && UUID_REGEX.test(s.media_id)) ? s.media_id : null,
        }));
        const { error: stepUpsertError } = await supabase.from("recipe_steps").upsert(stepsToUpsert);
        if (stepUpsertError) {
          console.error("STEP UPSERT ERROR:", stepUpsertError);
          return { success: false, error: "Error al guardar los pasos: " + stepUpsertError.message };
        }
      }
    }

    // INGREDIENTS
    if (ingredients) {
      const crypto = require('crypto');
      ingredients.forEach((i: any) => {
        if (i.db_id && UUID_REGEX.test(i.db_id)) {
          i.resolvedId = i.db_id;
        } else if (i.id && UUID_REGEX.test(i.id)) {
          i.resolvedId = i.id;
        } else {
          i.resolvedId = crypto.randomUUID();
        }
      });

      const existingIngIds = ingredients
        .map((i: any) => (i.db_id && UUID_REGEX.test(i.db_id)) ? i.db_id : (i.id && UUID_REGEX.test(i.id)) ? i.id : null)
        .filter(Boolean) as string[];
      
      if (existingIngIds.length > 0) {
        const { error: delError } = await supabase.from("recipe_ingredients")
          .delete()
          .eq("recipe_id", id)
          .not("id", "in", '(' + existingIngIds.join(',') + ')');
        if (delError) console.error("ING DEL ERROR:", delError);
      } else {
        await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
      }

      if (ingredients.length > 0) {
        const ingsToUpsert = ingredients.map((i: any, idx: number) => ({
          id: i.resolvedId,
          recipe_id: id,
          display_order: idx + 1,
          display_text: i.display_text || "",
          normalized_quantity: i.normalized_quantity ? Number(i.normalized_quantity) : null,
          unit_id: (i.unit_id && UUID_REGEX.test(i.unit_id)) ? i.unit_id : null,
          canonical_ingredient_id: (i.canonical_ingredient_id && UUID_REGEX.test(i.canonical_ingredient_id)) ? i.canonical_ingredient_id : null,
          is_scalable: i.is_scalable ?? true,
        }));
        
        const { error: ingError } = await supabase.from("recipe_ingredients").upsert(ingsToUpsert);
        if (ingError) {
          console.error("ING UPSERT ERROR:", ingError);
          return { success: false, error: "Error al guardar los ingredientes: " + ingError.message };
        }

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
                try {
                  await supabase.from('unmatched_ingredients').insert({ display_text: u.display_text, normalized_text: norm });
                } catch (ignored) {}
              }
            }
          }
        }

        // Save costs only for valid real ingredient IDs (manual escandallo per recipe)
        const costsToUpsert = ingredients
            .filter((i: any) => i.costData && (i.costData.purchase_amount || i.costData.purchase_price) && i.resolvedId && UUID_REGEX.test(i.resolvedId))
            .map((i: any) => ({
              id: i.resolvedId,
              recipe_id: id,
              owner_id: user.id,
              purchase_amount: i.costData.purchase_amount ? Number(i.costData.purchase_amount) : 1,
              purchase_unit_id: (i.costData.purchase_unit_id && UUID_REGEX.test(i.costData.purchase_unit_id)) ? i.costData.purchase_unit_id : null,
              purchase_price: i.costData.purchase_price ? Number(i.costData.purchase_price) : null
            }));
        
        if (costsToUpsert.length > 0) {
          const { error: costError } = await supabase.from("recipe_ingredient_costs").upsert(costsToUpsert);
          if (costError) console.error("COST UPSERT ERROR (non-fatal):", costError);
        }
      }
    }

    // VESSELS
    const hasFlatVessel = vessel_type_id || vessel_diameter_cm || vessel_notes;
    if ((vessels && vessels.length > 0) || hasFlatVessel) {
      await supabase.from("recipe_vessels").delete().eq("recipe_id", id);
      const v = (vessels && vessels.length > 0) ? vessels[0] : { vessel_type_id: vessel_type_id, diameter_cm: vessel_diameter_cm, notes: vessel_notes };
      if (v.vessel_type_id || v.diameter_cm || v.notes) {
        let finalVesselTypeId = (v.vessel_type_id && UUID_REGEX.test(v.vessel_type_id)) ? v.vessel_type_id : null;
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

    // TAGS
    if (tags) {
      await supabase.from("recipe_tags").delete().eq("recipe_id", id);
      const validTags = tags.filter((tid: string) => UUID_REGEX.test(tid));
      if (validTags.length > 0) {
        const tagsToInsert = validTags.map((tid: string) => ({
          recipe_id: id,
          tag_id: tid
        }));
        await supabase.from("recipe_tags").insert(tagsToInsert);
      }
    }

    // MEDIA
    if (media_ids) {
      await supabase.from("recipe_media").delete().eq("recipe_id", id);
      const normalizedMedia = media_ids
        .map((m: any, idx: number) => {
          const mid = typeof m === 'string' ? m : m?.id;
          const isPrimary = typeof m === 'object' && m?.is_primary !== undefined ? !!m.is_primary : idx === 0;
          return { id: mid, isPrimary };
        })
        .filter((m: any) => m.id && UUID_REGEX.test(m.id));

      if (normalizedMedia.length > 0) {
        // Ensure exactly one is marked as primary
        const primaryCount = normalizedMedia.filter((m: any) => m.isPrimary).length;
        if (primaryCount !== 1) {
          normalizedMedia.forEach((m: any, idx: number) => {
            m.isPrimary = idx === 0;
          });
        }

        const mediasToInsert = normalizedMedia.map((m: any, idx: number) => ({
          recipe_id: id,
          media_id: m.id,
          display_order: idx + 1,
          is_primary: m.isPrimary
        }));
        const { error: insertError } = await supabase.from("recipe_media").insert(mediasToInsert);
        if (insertError) console.error("MEDIA INSERT ERROR:", insertError);
      }
    }

    if (baseData.status === 'PUBLISHED') {
      try {
        await processFounderSpotAndEmail(user.id, user.email);
      } catch (founderErr) {
        console.error("Founder spot non-fatal error:", founderErr);
      }
    }

    try {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/recipes/" + id);
      revalidatePath("/recipes/" + id + "/edit");
      revalidatePath("/cookbook");
      revalidatePath("/");
    } catch (cacheErr) {
      // Non-fatal if called outside Next.js request context or if cache store is not initialized
      console.warn("revalidatePath warning:", cacheErr);
    }

    return { success: true, recipeId: id };
  } catch (err: any) {
    console.error("Unexpected error in updateRecipeFull:", err);
    return { success: false, error: err?.message || "Error inesperado al guardar la receta." };
  }
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


export async function deleteRecipe(recipeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "No autorizado. Inicia sesión de nuevo." }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminClient = serviceKey 
      ? createAdminClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }) 
      : supabase

    // 1. Verify recipe and ownership
    const { data: recipe } = await adminClient
      .from('recipes')
      .select('id, status, deleted_at, owner_id')
      .eq('id', recipeId)
      .maybeSingle()

    if (!recipe) {
      // Check via user client as fallback
      const { data: userRecipe } = await supabase
        .from('recipes')
        .select('id, status, deleted_at, owner_id')
        .eq('id', recipeId)
        .maybeSingle()

      if (!userRecipe) {
        // Recipe already does not exist or was deleted
        try {
          revalidatePath('/')
          revalidatePath('/cookbook')
        } catch {}
        return { success: true }
      }
      if (userRecipe.owner_id !== user.id) {
        return { success: false, error: "No tienes permiso para eliminar esta receta." }
      }
    } else if (recipe.owner_id !== user.id) {
      return { success: false, error: "No tienes permiso para eliminar esta receta." }
    }

    // 2. Clean up auxiliary relations (saves, want_to_cook, collection_recipes)
    await Promise.allSettled([
      adminClient.from('saves').delete().eq('recipe_id', recipeId),
      adminClient.from('want_to_cook').delete().eq('recipe_id', recipeId),
      adminClient.from('collection_recipes').delete().eq('recipe_id', recipeId),
      supabase.from('saves').delete().eq('recipe_id', recipeId),
      supabase.from('want_to_cook').delete().eq('recipe_id', recipeId),
    ])

    // 3. Check if there are cooking sessions from other users
    const { count: otherCooksCount } = await adminClient
      .from('cooking_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId)
      .neq('user_id', user.id)

    if (otherCooksCount && otherCooksCount > 0) {
      // Other users cooked it: soft-delete to preserve their cooking history
      // Unlink from active stories and social posts so they don't break
      await Promise.allSettled([
        adminClient.from('stories').update({ recipe_id: null }).eq('recipe_id', recipeId),
        adminClient.from('social_posts').update({ recipe_id: null }).eq('recipe_id', recipeId),
      ])

      let softDeleted = false
      const { error: softErr } = await adminClient
        .from('recipes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', recipeId)

      if (!softErr) {
        softDeleted = true
      } else {
        console.error("Soft delete via adminClient failed:", softErr)
        const { error: userSoftErr } = await supabase
          .from('recipes')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', recipeId)
        if (!userSoftErr) {
          softDeleted = true
        } else {
          console.error("Soft delete via user client failed:", userSoftErr)
        }
      }

      // If soft-delete failed, fallback to hard delete so the user is never stuck
      if (!softDeleted) {
        const { error: fallbackDelErr } = await adminClient.from('recipes').delete().eq('id', recipeId)
        if (fallbackDelErr) {
          const { error: userDelErr } = await supabase.from('recipes').delete().eq('id', recipeId)
          if (userDelErr) {
            return { success: false, error: userDelErr.message || fallbackDelErr.message }
          }
        }
      }
    } else {
      // No cooking sessions by other users: hard delete completely!
      // ON DELETE CASCADE cleanly removes recipe_ingredients, recipe_steps, recipe_media, etc.
      let hardDeleted = false
      const { error: delErr } = await adminClient.from('recipes').delete().eq('id', recipeId)
      if (!delErr) {
        hardDeleted = true
      } else {
        console.error("Hard delete via adminClient failed:", delErr)
        const { error: userDelErr } = await supabase.from('recipes').delete().eq('id', recipeId)
        if (!userDelErr) {
          hardDeleted = true
        } else {
          console.error("Hard delete via user client failed:", userDelErr)
          // Try soft delete as fallback
          const { error: softFallbackErr } = await adminClient
            .from('recipes')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', recipeId)
          if (!softFallbackErr) {
            hardDeleted = true
          } else {
            return { success: false, error: userDelErr.message || delErr.message }
          }
        }
      }
    }

    try {
      revalidatePath('/')
      revalidatePath('/cookbook')
      revalidatePath(`/recipes/${recipeId}`)
      revalidatePath('/[userParam]', 'layout')
    } catch (revErr) {
      console.warn("Revalidate path warning:", revErr)
    }

    return { success: true }
  } catch (err: any) {
    console.error("deleteRecipe uncaught error:", err)
    return { success: false, error: err?.message || "Error al eliminar la receta." }
  }
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

export async function getOrCreateRiceVariety(name: string) {
  const trimmed = name?.trim();
  if (!trimmed) {
    throw new Error("El nombre de la variedad no puede estar vacío");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Check if variety already exists (case-insensitive)
  const { data: existing } = await supabase
    .from("rice_varieties")
    .select("id, name")
    .ilike("name", trimmed)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  // Capitalize first letter of each word or standard capitalization
  const formattedName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = serviceKey
    ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', serviceKey)
    : supabase;

  const { data: created, error: insertError } = await client
    .from("rice_varieties")
    .insert({ name: formattedName })
    .select("id, name")
    .single();

  if (insertError) {
    // Retry finding in case of race condition or duplicate
    const { data: retryData } = await supabase
      .from("rice_varieties")
      .select("id, name")
      .ilike("name", formattedName)
      .maybeSingle();

    if (retryData) {
      return retryData;
    }
    console.error("Error creating rice variety:", insertError);
    throw new Error("No se pudo guardar la nueva variedad de arroz");
  }

  revalidatePath("/recipes", "layout");
  revalidatePath("/discover");
  return created;
}
