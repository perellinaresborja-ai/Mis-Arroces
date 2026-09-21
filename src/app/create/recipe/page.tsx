import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateRecipeOptions from "@/components/domain/CreateRecipeOptions";

export default async function CreateRecipePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  async function createManualAction() {
    "use server"
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Look for an existing empty draft to reuse
    const { data: existingEmpty } = await supabase
      .from("recipes")
      .select("id, name, description, base_servings, rice_qty, stock_qty, stock_ingredient_id, cook_time, rest_time, difficulty, style_id, variety_id, heat_source_id, recipe_steps(id), recipe_ingredients(id), recipe_media(id)")
      .eq("owner_id", user.id)
      .eq("status", "DRAFT")
      .eq("name", "Nueva Receta")
      .order("created_at", { ascending: false })
      .limit(5);

    // Find one that truly has no nested records and no modified base fields
    const trueEmpty = existingEmpty?.find(
      (r: any) => 
        r.recipe_steps.length === 0 && 
        r.recipe_ingredients.length === 0 && 
        r.recipe_media.length === 0 &&
        !r.description && !r.base_servings && !r.rice_qty && !r.stock_qty && !r.stock_ingredient_id && !r.cook_time && !r.rest_time && !r.difficulty && !r.style_id && !r.variety_id && !r.heat_source_id
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

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <CreateRecipeOptions createManualAction={createManualAction} />
    </div>
  );
}
