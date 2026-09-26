import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditPostClient } from "./EditPostClient"

export const metadata = {
  title: "Editar Publicación | misarroces",
}

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let { data: post, error } = await supabase
    .from("social_posts")
    .select(`
      *,
      recipe:recipes(id, name),
      post_media(display_order, is_primary, media:media_assets(id, storage_path, media_type))
    `)
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single()

  if (error && (error.code === "42703" || error.message?.includes("is_primary"))) {
    const fallbackRes = await supabase
      .from("social_posts")
      .select(`
        *,
        recipe:recipes(id, name),
        post_media(display_order, media:media_assets(id, storage_path, media_type))
      `)
      .eq("id", params.id)
      .eq("author_id", user.id)
      .single()
    post = fallbackRes.data
      ? ({
          ...fallbackRes.data,
          post_media: (fallbackRes.data.post_media || []).map((m: any) => ({ ...m, is_primary: false }))
        } as any)
      : null
  }

  if (!post) redirect("/")

  // Fetch collaborator profile if exists
  let initialCollaborator = null
  if (post.collaborator_id) {
    const { data: colProfile } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .eq("id", post.collaborator_id)
      .maybeSingle()
    if (colProfile) initialCollaborator = colProfile
  }

  // Fetch initial tagged users
  const { data: taggedRows } = await supabase
    .from("tagged_users")
    .select("tagged:profiles!tagged_users_tagged_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))")
    .eq("entity_type", "social_post")
    .eq("entity_id", post.id)

  const initialTags = (taggedRows || []).map((r: any) => r.tagged).filter(Boolean)

  const initialRecipe = post.recipe ? { id: post.recipe.id, name: post.recipe.name } : null

  return (
    <div className="max-w-2xl mx-auto p-4 pt-6 md:pt-12 min-h-screen space-y-6">
      <EditPostClient
        post={post}
        initialTags={initialTags}
        initialCollaborator={initialCollaborator}
        initialRecipe={initialRecipe}
        initialMedia={post.post_media || []}
      />
    </div>
  )
}
