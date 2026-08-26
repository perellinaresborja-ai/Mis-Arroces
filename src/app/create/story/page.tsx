import { StoryCreator } from "@/components/domain/StoryCreator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Crear Story | Mis Arroces",
  description: "Crea una nueva Story en Mis Arroces",
}

export default async function CreateStoryPage(props: { searchParams?: Promise<{ recipe_id?: string, session_id?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  
  const searchParams = await props.searchParams;

  return (
    <div className="bg-black min-h-screen">
      <StoryCreator 
        initialRecipeId={searchParams?.recipe_id} 
        initialSessionId={searchParams?.session_id} 
      />
    </div>
  )
}
