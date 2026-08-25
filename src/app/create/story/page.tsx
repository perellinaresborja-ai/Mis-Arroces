import { createClient } from "@/lib/supabase/server"
import { StoryForm } from "./StoryForm"

export default async function CreateStoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's recipes to link
  const { data: recipes } = await supabase.from("recipes").select("id, name").eq("owner_id", user?.id || "").order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24 md:pb-8">
      <div className="w-full max-w-lg space-y-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
        
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tu historia</h1>
          <p className="text-muted-foreground">Comparte un momento arrocero efímero</p>
        </div>

        <StoryForm recipes={recipes || []} />
      </div>
    </div>
  )
}
