import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CreateRecipeRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Look for an existing empty draft to reuse
  const { data: existingEmpty } = await supabase
    .from("recipes")
    .select("id, name, recipe_steps(id), recipe_ingredients(id), recipe_media(id)")
    .eq("owner_id", user.id)
    .eq("status", "DRAFT")
    .eq("name", "Nueva Receta")
    .order("created_at", { ascending: false })
    .limit(5);

  // Find one that truly has no nested records
  const trueEmpty = existingEmpty?.find(
    r => r.recipe_steps.length === 0 && r.recipe_ingredients.length === 0 && r.recipe_media.length === 0
  );

  if (trueEmpty) {
    redirect("/recipes/" + trueEmpty.id + "/edit");
  }

  // Create a new empty draft recipe if none exists
  const name = "Nueva Receta";
  const slug = "nueva-receta-" + Date.now();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      owner_id: user.id,
      name,
      slug,
      status: "DRAFT",
    })
    .select()
    .single();

  if (error || !recipe) {
    console.error("Failed to create draft recipe", error);
    redirect("/cookbook");
  }

  redirect("/recipes/" + recipe.id + "/edit");
}
