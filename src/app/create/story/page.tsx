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
  let recipeData = null;
  let recipeMedia = null;
  
  if (searchParams?.recipe_id) {
    const { data } = await supabase.from('recipes').select('id, name').eq('id', searchParams.recipe_id).single();
    recipeData = data;
    const { data: media } = await supabase.from('recipe_media').select('media_assets(storage_path)').eq('recipe_id', searchParams.recipe_id).order('display_order', {ascending: true}).limit(1).maybeSingle();
    
    if (media) {
      const ma = (media as unknown as { media_assets?: { storage_path: string } }).media_assets;
      if (ma) {
        recipeMedia = { url: supabase.storage.from('media').getPublicUrl(ma.storage_path).data.publicUrl };
      }
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <StoryCreator 
        initialRecipe={recipeData ? { id: recipeData.id, name: recipeData.name, coverUrl: recipeMedia?.url } : undefined}
      />
    </div>
  )
}
