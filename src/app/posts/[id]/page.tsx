// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ShareButton } from "@/components/domain/ShareButton"
import { ReactionButton } from "@/components/domain/ReactionButton"
import { CommentSection } from "@/components/domain/CommentSection"
import { MediaCarousel } from "@/components/domain/MediaCarousel"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from("social_posts")
    .select(`
      *,
      author:profiles!social_posts_author_id_fkey(username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      recipe:recipes(id, name),
      post_media(
        display_order,
        media:media_assets(id, storage_path)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!post) notFound()

  // Validate visibility manually for extra security
  const isOwner = user?.id === post.author_id
  let canView = isOwner || post.visibility === "PUBLIC"
  
  if (!canView && user && post.visibility === "FOLLOWERS") {
    const { data: follow } = await supabase.from("follows").select("status").match({ follower_id: user.id, following_id: post.author_id, status: "ACCEPTED" }).single()
    if (follow) canView = true
  }

  if (!canView) notFound()

  // Sort media
  const mediaItems = post.post_media
    ?.sort((a: any, b: any) => a.display_order - b.display_order)
    .map((pm: any) => pm.media)
    .filter(Boolean) || []

  // Fetch reactions & comments
  const [{ data: reactions }, { data: commentsRaw }] = await Promise.all([
    supabase.from("post_likes").select("emoji, user_id").eq("post_id", post.id),
    supabase.from("post_comments").select(`
      id, content, created_at, is_deleted, parent_id,
      author:profiles!post_comments_author_id_fkey(username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      reactions:post_comment_likes(emoji, user_id)
    `).eq("post_id", post.id).order("created_at", { ascending: true })
  ])

  const comments = commentsRaw?.map(c => ({
    ...c,
    reactions: c.reactions || []
  })) || []

  const avatarUrl = post.author?.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${post.author.avatar?.storage_path}`
    : null

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-8">
      
      <article className="bg-card md:rounded-3xl border border-border p-4 sm:p-6 space-y-6 shadow-sm">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href={`/@${post.author?.username}`} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
              {avatarUrl && <img src={avatarUrl} alt={post.author?.username} className="w-full h-full object-cover" />}
            </div>
            <div>
              <div className="font-bold text-[16px] group-hover:underline">
                {post.author?.display_name}
              </div>
              <div className="text-[14px] text-muted-foreground flex items-center gap-1">
                @{post.author?.username} <span>·</span> {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        </header>

        {/* Text */}
        <p className="whitespace-pre-wrap text-[16px]">{post.content}</p>

        {/* Media */}
        {mediaItems.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <MediaCarousel items={mediaItems} />
          </div>
        )}

        {/* Linked Recipe */}
        {post.recipe && (
          <div className="bg-muted border border-border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receta vinculada</p>
              <Link href={`/recipes/${post.recipe.id}`} className="font-bold hover:underline text-lg">{post.recipe.name}</Link>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <footer className="flex items-center justify-between pt-4 border-t border-border/50 text-muted-foreground">
          <div className="flex gap-6">
            <ReactionButton 
              entityType="post" 
              entityId={post.id} 
              reactions={reactions || []}
              currentUserId={user?.id || null}
            />
          </div>
          <ShareButton 
            title={`Publicación de ${post.author?.display_name}`} 
            text=""
            path={`/posts/${post.id}`} 
          />
        </footer>

      </article>

      {/* Comments */}
      <div className="bg-card md:rounded-3xl border border-border p-4 sm:p-6 shadow-sm">
        <CommentSection 
          entityType="post" 
          entityId={post.id} 
          comments={comments || []} 
          currentUserId={user?.id || null} 
          allowComments={post.allow_comments} 
        />
      </div>

    </div>
  )
}
