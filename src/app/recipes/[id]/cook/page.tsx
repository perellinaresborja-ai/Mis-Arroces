import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CookForm } from "./CookForm"

export default async function CookRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: recipe } = await supabase.from("recipes").select("id, name").eq("id", resolvedParams.id).single()
  if (!recipe) notFound()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24 md:pb-8">
      <div className="w-full max-w-lg space-y-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
        <header className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold">Lo he cocinado</h1>
          <p className="text-muted-foreground">{recipe.name}</p>
        </header>

        <CookForm recipeId={recipe.id} />
      </div>
    </div>
  )
}
