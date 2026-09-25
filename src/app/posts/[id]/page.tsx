// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ShareButton } from "@/components/domain/ShareButton"
import { ReactionButton } from "@/components/domain/ReactionButton"
import { CommentSection } from "@/components/domain/CommentSection"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { PostOptionsMenu } from "@/components/domain/PostOptionsMenu"
import { ReportButton } from "@/components/domain/ReportButton"
import { SocialTextRenderer } from "@/components/domain/SocialTextRenderer"
import { MapPin, Tag, ChefHat, Users } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("social_posts")
    .select(`
      id, content, visibility,
      author:profiles!social_posts_author_id_fkey(username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      post_media(display_order, media:media_assets(storage_path, media_type))
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!post || post.visibility !== "PUBLIC") {
    return {
      title: "Publicación no encontrada",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const authorName = post.author?.display_name || post.author?.username || "un arrocero"
  const title = `Publicación de @${post.author?.username || authorName}`
  const description = post.content ? (post.content.length > 150 ? post.content.slice(0, 147) + "..." : post.content) : `Mira la publicación de @${authorName} en misarroces.`
  const firstMedia = post.post_media?.sort((a: any, b: any) => a.display_order - b.display_order)?.[0]?.media?.storage_path
  const imageUrl = firstMedia
    ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${firstMedia}`
    : "https://www.misarroces.es/logopaellaicono.png"
  const canonicalUrl = `https://www.misarroces.es/posts/${post.id}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | misarroces`,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "misarroces",
      images: [{
        url: imageUrl,
        alt: title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | misarroces`,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}

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
        media:media_assets(id, storage_path, media_type)
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

  // Fetch reactions & comments, collaborator & tagged users
  const [{ data: reactions }, { data: commentsRaw }, collabRes, tagsRes] = await Promise.all([
    supabase.from("post_likes").select("emoji, user_id").eq("post_id", post.id),
    supabase.from("post_comments").select(`
      id, content, created_at, is_deleted, parent_id,
      author:profiles!post_comments_author_id_fkey(username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      reactions:post_comment_likes(emoji, user_id)
    `).eq("post_id", post.id).order("created_at", { ascending: true }),
    post.collaborator_id 
      ? supabase.from("profiles").select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)").eq("id", post.collaborator_id).maybeSingle()
      : Promise.resolve({ data: null }),
    (supabase as any)
      .from("tagged_users")
      .select("tagged:profiles!tagged_users_tagged_id_fkey(id, username, display_name)")
      .eq("entity_type", "social_post")
      .eq("entity_id", post.id)
  ])

  const collaborator = collabRes?.data || null
  const taggedUsers = (tagsRes?.data || []).map((t: any) => t.tagged).filter(Boolean)

  const comments = commentsRaw?.map(c => ({
    ...c,
    reactions: c.reactions || []
  })) || []

  const avatarUrl = post.author?.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${post.author.avatar?.storage_path}`
    : null

  const collaboratorAvatarUrl = collaborator?.avatar?.storage_path
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${collaborator.avatar?.storage_path}`
    : null

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-8">
      
      <article className="bg-card md:rounded-3xl border border-border p-4 sm:p-6 space-y-5 shadow-sm">
        
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatars */}
            <div className="relative shrink-0">
              <Link href={`/@${post.author?.username}`}>
                <div className="w-11 h-11 rounded-full bg-muted overflow-hidden">
                  {avatarUrl && <img src={avatarUrl} alt={post.author?.username} className="w-full h-full object-cover" />}
                </div>
              </Link>
              {collaborator && (
                <Link href={`/@${collaborator.username}`}>
                  <div className="w-6 h-6 rounded-full bg-card border-2 border-card overflow-hidden absolute -bottom-1 -right-1 shadow-sm" title={`Colaborador: @${collaborator.username}`}>
                    {collaboratorAvatarUrl ? (
                      <img src={collaboratorAvatarUrl} alt={collaborator.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                        {collaborator.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Names & meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/@${post.author?.username}`} className="font-bold text-[15px] hover:underline truncate">
                  {post.author?.display_name || post.author?.username}
                </Link>
                {collaborator && (
                  <>
                    <span className="text-xs text-muted-foreground">y</span>
                    <Link href={`/@${collaborator.username}`} className="font-bold text-[15px] hover:underline truncate flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {collaborator.display_name || collaborator.username}
                    </Link>
                  </>
                )}
              </div>

              <div className="text-[13px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span>@{post.author?.username}</span>
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{post.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner ? (
              <PostOptionsMenu 
                entityType="post" 
                entityId={post.id} 
                allowComments={post.allow_comments} 
                isPinned={post.is_pinned}
                hidePin={true}
              />
            ) : (
              <ReportButton
                targetType="POST"
                targetId={post.id}
                reportedUserId={post.author_id}
                contentSnapshot={{
                  postId: post.id,
                  authorId: post.author_id,
                  authorUsername: post.author?.username,
                  content: post.content,
                  createdAt: post.created_at
                }}
                title="Reportar publicación"
                variant="button"
                label="Reportar"
                isAuthenticated={!!user}
              />
            )}
          </div>
        </header>

        {/* Media */}
        {mediaItems.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <MediaCarousel items={mediaItems} priority={true} />
          </div>
        )}

        {/* Tagged users chip */}
        {taggedUsers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground px-1">
            <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Con</span>
            {taggedUsers.map((u: any, idx: number) => (
              <Link 
                key={u.id} 
                href={`/@${u.username}`} 
                className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center"
              >
                @{u.username}{idx < taggedUsers.length - 1 ? "," : ""}
              </Link>
            ))}
          </div>
        )}

        {/* Text with @mentions and #hashtags */}
        {post.content && (
          <div className="text-[15px] leading-relaxed px-1">
            <SocialTextRenderer content={post.content} />
          </div>
        )}

        {/* Linked Recipe */}
        {post.recipe && (
          <div className="bg-muted/60 border border-border rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Receta vinculada</p>
                <Link href={`/recipes/${post.recipe.id}`} className="font-bold text-foreground hover:underline text-sm truncate block">
                  {post.recipe.name}
                </Link>
              </div>
            </div>
            <Link href={`/recipes/${post.recipe.id}`} className="shrink-0 text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-lg bg-primary/10">
              Ver receta
            </Link>
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
