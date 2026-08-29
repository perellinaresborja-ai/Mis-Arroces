import { BackButton } from "@/components/domain/BackButton"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostForm } from "./PostForm"

export const metadata = {
  title: "Nueva Publicación | Mis Arroces",
}

export default async function CreatePostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's recipes to allow linking
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8"><BackButton /><h1 className="text-2xl font-bold">Crear Publicación</h1></div>
      <PostForm recipes={recipes || []} />
    </div>
  )
}
