import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCatalogs } from "@/app/actions/recipes"
import EditRecipeForm from "./EditRecipeForm"

export default async function EditRecipePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: recipe } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients(*),
      recipe_steps(*),
      recipe_vessels(*)
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!recipe) redirect("/cookbook")
  
  // Security check: Only owner can edit
  if (recipe.owner_id !== user.id) redirect(`/recipes/${recipe.id}`)

  const catalogs = await getCatalogs()

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="font-bold truncate pr-4 text-foreground">Editar: {recipe.name}</h1>
      </header>
      <main className="p-4 max-w-md mx-auto">
        <EditRecipeForm recipe={recipe} catalogs={catalogs} />
      </main>
    </div>
  )
}
