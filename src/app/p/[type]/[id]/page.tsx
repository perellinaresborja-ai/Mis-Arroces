// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FeedCard } from "@/components/domain/FeedCard"
import { BackButton } from "@/components/domain/BackButton"

// @ts-nocheck
export default async function FeedItemPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const resolvedParams = await params
  const { type, id } = resolvedParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let feedItem = null;

  if (type === 'post') {
    const { data } = await supabase.from("social_posts").select(`
      *, 
      author:profiles!social_posts_author_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), 
      post_media(display_order, media:media_assets(id, storage_path)), 
      recipe:recipes(id, name)
    `).eq("id", id).single()
    
    if (data) {
      let isLiked = false
      if (user) {
        const { data: l } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id).eq("post_id", id).single()
        isLiked = !!l
      }
      feedItem = {
        entity_type: 'post',
        entity_id: data.id,
        user_id: data.author_id,
        created_at: data.created_at,
        visibility: data.visibility,
        author: data.author,
        content: data.content,
        media: data.post_media?.sort((a: any, b: any) => a.display_order - b.display_order).map((m: any) => m.media?.storage_path).filter(Boolean) || [],
        recipe: data.recipe,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        isLiked
      }
    }
  } else if (type === 'recipe') {
    const { data } = await supabase.from("recipes").select(`
      *, 
      author:profiles!recipes_owner_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), 
      recipe_media(display_order, is_primary, media:media_assets(id, storage_path))
    `).eq("id", id).single()

    if (data) {
      let isLiked = false
      if (user) {
        const { data: l } = await supabase.from("recipe_likes").select("recipe_id").eq("user_id", user.id).eq("recipe_id", id).single()
        isLiked = !!l
      }
      feedItem = {
        entity_type: 'recipe',
        entity_id: data.id,
        user_id: data.owner_id,
        created_at: data.created_at,
        visibility: data.visibility,
        author: data.author,
        recipeName: data.name,
        recipeType: data.rice_type,
        media: data.recipe_media?.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order || 0) - (b.display_order || 0)).map((m: any) => m.media?.storage_path || m.media_assets?.storage_path).filter(Boolean) || [],
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        isLiked
      }
    }
  } else if (type === 'session') {
    const { data } = await supabase.from("cooking_sessions").select(`
      *, 
      author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), 
      session_media(display_order, media:media_assets(id, storage_path)), 
      recipe:recipes(id, name)
    `).eq("id", id).single()

    if (data) {
      let isLiked = false
      if (user) {
        const { data: l } = await supabase.from("session_likes").select("session_id").eq("user_id", user.id).eq("session_id", id).single()
        isLiked = !!l
      }
      feedItem = {
        entity_type: 'session',
        entity_id: data.id,
        user_id: data.user_id,
        created_at: data.created_at,
        visibility: data.visibility,
        author: data.author,
        content: data.notes,
        rating: data.rating,
        media: data.session_media?.sort((a: any, b: any) => a.display_order - b.display_order).map((m: any) => m.media?.storage_path).filter(Boolean) || [],
        recipe: data.recipe,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        isLiked
      }
    }
  }

  if (!feedItem) notFound()

  // Protect privacy
  const isOwner = user?.id === feedItem.user_id
  const isAuthorPrivate = (feedItem.author as any)?.privacy_level === "PRIVATE"

  if (!isOwner) {
    if (feedItem.visibility === 'PRIVATE') notFound()
    if (isAuthorPrivate || feedItem.visibility === 'FOLLOWERS') {
      if (!user) notFound()
      const { data: follows } = await supabase
        .from("follows")
        .select("status")
        .match({ follower_id: user.id, following_id: feedItem.user_id, status: "ACCEPTED" })
        .maybeSingle()
      if (follows?.status !== "ACCEPTED") notFound()
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex h-14 items-center px-4 max-w-2xl mx-auto">
          <BackButton fallbackUrl="/" className="mr-4 p-2 -ml-2 rounded-full hover:bg-muted transition-colors cursor-pointer" iconClassName="w-5 h-5" />
          <h1 className="font-bold text-lg">Publicación</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pt-4 px-0 sm:px-4">
        <FeedCard
          entityType={feedItem.entity_type}
          entityId={feedItem.entity_id}
          user={feedItem.author}
          createdAt={feedItem.created_at}
          mediaUrls={feedItem.media}
          postContent={feedItem.content}
          recipeName={feedItem.recipeName}
          recipeType={feedItem.recipeType}
          linkedRecipe={feedItem.recipe}
          rating={feedItem.rating}
          initialLikes={feedItem.likes_count}
          commentCount={feedItem.comments_count}
          isLiked={feedItem.isLiked}
          currentUserId={user?.id || null}
          isPublicView={true}
        />
      </main>
    </div>
  )
}
