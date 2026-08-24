"use server"

import { revalidatePath } from "next/cache"
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
  
  const [styles, varieties, vessels, heats, units] = await Promise.all([
    supabase.from("rice_styles").select("*"),
    supabase.from("rice_varieties").select("*"),
    supabase.from("vessel_types").select("*"),
    supabase.from("heat_sources").select("*"),
    supabase.from("units").select("*"),
  ])

  return {
    styles: styles.data || [],
    varieties: varieties.data || [],
    vessels: vessels.data || [],
    heats: heats.data || [],
    units: units.data || [],
  }
}
