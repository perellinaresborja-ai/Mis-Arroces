import { StoryCreator } from "@/components/domain/StoryCreator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Crear Story | Mis Arroces",
  description: "Crea una nueva Story en Mis Arroces",
}

export default async function CreateStoryPage(props: { searchParams?: Promise<{ recipe_id?: string, session_id?: string, share?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  
  const searchParams = await props.searchParams;
  let finalRecipeId = searchParams?.recipe_id;
  let finalSessionId = searchParams?.session_id;

  if (searchParams?.share) {
    if (searchParams.share.startsWith('/recipes/')) {
      finalRecipeId = searchParams.share.split('/recipes/')[1];
    } else if (searchParams.share.startsWith('/sessions/')) {
      finalSessionId = searchParams.share.split('/sessions/')[1];
    }
  }

  let recipeData = null;
  let recipeMedia = null;
  let sessionData = null;
  
  if (finalRecipeId) {
    const { data } = await supabase.from('recipes').select('id, name').eq('id', finalRecipeId).single();
    recipeData = data;
    const { data: media } = await supabase.from('recipe_media').select('media_assets(storage_path)').eq('recipe_id', finalRecipeId).order('display_order', {ascending: true}).limit(1).maybeSingle();
    
    if (media) {
      const ma = (media as unknown as { media_assets?: { storage_path: string } }).media_assets;
      if (ma) {
        recipeMedia = { url: supabase.storage.from('recipe_media').getPublicUrl(ma.storage_path).data.publicUrl };
      }
    }
  } else if (finalSessionId) {
    const { data } = await supabase.from('cooking_sessions').select('id, author:profiles!cooking_sessions_user_id_fkey(display_name)').eq('id', finalSessionId).single();
    if (data) {
      sessionData = { id: data.id, authorName: (data.author as any)?.display_name || 'Usuario' };
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <StoryCreator 
        initialRecipe={recipeData ? { id: recipeData.id, name: recipeData.name, coverUrl: recipeMedia?.url } : undefined}
        initialSession={sessionData ? { id: sessionData.id, authorName: sessionData.authorName } : undefined}
      />
    </div>
  )
}
