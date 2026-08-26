"use server"

import { createClient } from "@/lib/supabase/server"
import { trackEvent } from "@/app/actions/analytics"
import { revalidatePath } from "next/cache"

export async function fetchShoppingList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: list } = await supabase
    .from("shopping_lists")
    .select("*, shopping_list_items(*, unit:units(id, name))")
    .eq("user_id", user.id)
    .single()

  return list
}

export async function addRecipeToShoppingList(recipeId: string, targetServings?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Get or create list
  let listId = ""
  const { data: existingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .single()
    
  if (existingList) {
    listId = existingList.id
  } else {
    const { data: newList } = await supabase
      .from("shopping_lists")
      .insert({ user_id: user.id, name: "Mi compra" })
      .select("id")
      .single()
    if (newList) listId = newList.id
  }

  if (!listId) throw new Error("Failed to get shopping list")

    // 2. Fetch recipe ingredients
  const { data: recipe } = await supabase
    .from("recipes")
    .select("base_servings, rice_qty, stock_qty, variety:rice_varieties(name), recipe_ingredients(*, unit:units(id, name))")
    .eq("id", recipeId)
    .single()

  if (!recipe) return

    // Synthetic ingredients for Rice and Stock
  
  const ratio = (targetServings && recipe.base_servings) ? targetServings / recipe.base_servings : 1;
  
  const ingredientsToAdd: any[] = recipe.recipe_ingredients ? [...recipe.recipe_ingredients] : []
  
  if (recipe.rice_qty) {
    const riceName = recipe.variety && (recipe.variety as any).name ? `Arroz (${(recipe.variety as any).name})` : 'Arroz';
    ingredientsToAdd.push({
      display_text: riceName,
      normalized_quantity: recipe.rice_qty,
      unit: { name: "g" },
      unit_id: null // We will resolve this below
    })
  } else {
    ingredientsToAdd.push({ display_text: "Arroz", normalized_quantity: null, unit: null, unit_id: null })
  }
  
  if (recipe.stock_qty) {
    ingredientsToAdd.push({
      display_text: "Caldo",
      normalized_quantity: recipe.stock_qty,
      unit: { name: "ml" },
      unit_id: null
    })
  } else {
    ingredientsToAdd.push({ display_text: "Caldo", normalized_quantity: null, unit: null, unit_id: null })
  }

  // 3. Get existing items to merge
  const { data: currentItems } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("list_id", listId)
    .eq("is_checked", false)

  // We map by normalized name to check for merges
  const normalize = (s: string) => s.toLowerCase().trim()
  
  const toUpsert = []
  const toInsert = []

  // Create lookup for existing items
  const existingMap = new Map()
  currentItems?.forEach((item: any) => {
    const key = `${normalize(item.ingredient_name)}_${item.unit_id}`
    existingMap.set(key, item)
  })

  // Conversion rates roughly (for V1, only perfect matches or known g/kg ml/L)
  // To avoid complex DB unit queries here, we just check if unit_id matches exactly for now.
  // Wait, the prompt says "conversión mínima V1: g <-> kg, ml <-> L, unidad <-> unidad".
  // Let's fetch the units first.
  const { data: allUnits } = await supabase.from("units").select("*")
  const unitsBySymbol = new Map(allUnits?.map((u: any) => [u.name?.toLowerCase(), u]))
  const unitsById = new Map(allUnits?.map((u: any) => [u.id, u]))

  const gramUnit = unitsBySymbol.get("g")
  const kgUnit = unitsBySymbol.get("kg")
  const mlUnit = unitsBySymbol.get("ml")
  const literUnit = unitsBySymbol.get("l")

  const convertQuantity = (q: number, fromId: string | null, toId: string | null) => {
    if (fromId === toId) return q
    if (fromId === gramUnit?.id && toId === kgUnit?.id) return q / 1000
    if (fromId === kgUnit?.id && toId === gramUnit?.id) return q * 1000
    if (fromId === mlUnit?.id && toId === literUnit?.id) return q / 1000
    if (fromId === literUnit?.id && toId === mlUnit?.id) return q * 1000
    return null // incompatible
  }

  for (const ing of ingredientsToAdd) {
    if (ing.normalized_quantity && ratio !== 1) {
      ing.normalized_quantity = ing.normalized_quantity * ratio;
    }
    // Resolve synthetic unit_ids if missing
    if (!ing.unit_id && ing.unit?.name) {
      const u = unitsBySymbol.get(ing.unit.name.toLowerCase())
      if (u) ing.unit_id = u.id
    }

    if (!ing.display_text) continue
    const normName = normalize(ing.display_text)
    let matched = false

    // Try to find compatible existing item
    for (const [key, existItem] of existingMap.entries()) {
      const existName = normalize(existItem.ingredient_name)
      if (existName === normName) {
        const converted = convertQuantity(Number(ing.normalized_quantity || 0), ing.unit_id, existItem.unit_id)
        if (converted !== null) {
          // Merge
          existItem.quantity = Number(existItem.quantity || 0) + converted
          toUpsert.push(existItem)
          matched = true
          break
        }
      }
    }

    if (!matched) {
      toInsert.push({
        list_id: listId,
        ingredient_name: ing.display_text,
        quantity: ing.normalized_quantity || null,
        unit_id: ing.unit_id,
        recipe_id: recipeId
      })
    }
  }

  // Execute saves
  if (toUpsert.length > 0) {
    for (const item of toUpsert) {
      await supabase.from("shopping_list_items").update({ quantity: item.quantity }).eq("id", item.id)
    }
  }
  if (toInsert.length > 0) {
    await supabase.from("shopping_list_items").insert(toInsert)
  }

  revalidatePath("/shopping-list")
}

export async function toggleShoppingItem(itemId: string, checked: boolean) {
  const supabase = await createClient()
  await supabase.from("shopping_list_items").update({ is_checked: checked }).eq("id", itemId)
  revalidatePath("/shopping-list")
}

export async function removeShoppingItem(itemId: string) {
  const supabase = await createClient()
  await supabase.from("shopping_list_items").delete().eq("id", itemId)
  revalidatePath("/shopping-list")
}

export async function clearCheckedShoppingItems(listId: string) {
  const supabase = await createClient()
  await supabase.from("shopping_list_items").delete().eq("list_id", listId).eq("is_checked", true)
  revalidatePath("/shopping-list")
}

export async function clearShoppingList(listId: string) {
  const supabase = await createClient()
  await supabase.from("shopping_list_items").delete().eq("list_id", listId)
  revalidatePath("/shopping-list")
}




