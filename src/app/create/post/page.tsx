import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostForm } from "./PostForm"

export const metadata = {
  title: "Crear publicación | misarroces",
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
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-xl mx-auto py-6 md:py-8 px-4">
      <PostForm recipes={recipes || []} />
    </div>
  )
}
