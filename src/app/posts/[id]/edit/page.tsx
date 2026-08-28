import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditPostClient } from "./EditPostClient"

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: post } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single()

  if (!post) redirect("/")

  return (
    <div className="max-w-2xl mx-auto p-4 pt-12 md:pt-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Editar Publicación</h1>
      <EditPostClient post={post} />
    </div>
  )
}
