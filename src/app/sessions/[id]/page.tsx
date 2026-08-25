// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ShareButton } from "@/components/domain/ShareButton"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { LikeButton } from "@/components/domain/LikeButton"
import { CommentSection } from "@/components/domain/CommentSection"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from("cooking_sessions")
    .select(`
      *,
      user:profiles!cooking_sessions_user_id_fkey(username, display_name),
      recipe:recipes(id, name, owner_id),
      session_media(
        display_order,
        media:media_assets(id, storage_path)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!session) notFound()

  // Sort media by display_order
  const mediaItems = session.session_media
    ?.sort((a: any, b: any) => a.display_order - b.display_order)
    .map((sm: any) => sm.media)
    .filter(Boolean) || []

  // Validate visibility manually for extra security, though RLS protects it
  const isOwner = user?.id === session.user_id
  let canView = isOwner || session.visibility === "PUBLIC"
  
  if (!canView && user && session.visibility === "FOLLOWERS") {
    const { data: follow } = await supabase.from("follows").select("status").match({ follower_id: user.id, following_id: session.user_id, status: "ACCEPTED" }).single()
    if (follow) canView = true
  }

  if (!canView) notFound()

  const { count: likeCount } = await supabase.from("session_likes").select("*", { count: "exact", head: true }).eq("session_id", session.id)
  const { data: likesData } = await supabase.from("session_likes" as any).select("user_id").eq("session_id", session.id)
  const isLiked = user ? likesData?.some((l: any) => l.user_id === user.id) : false
  const { data: commentsRaw } = await supabase.from("session_comments").select(`
      id, content, is_deleted, created_at, parent_id,
      author:profiles(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      likes:session_comment_likes(user_id)
    `).eq("session_id", session.id).order("created_at", { ascending: true })

  const comments = commentsRaw?.map(c => ({
    ...c,
    like_count: c.likes?.length || 0,
    user_liked: user ? c.likes?.some((l: any) => l.user_id === user.id) : false
  })) || []


  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto space-y-8">
      
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cocinado</h1>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>
            Realizado por <Link href={`/@${session.user?.username}`} className="text-primary hover:underline font-medium">@{session.user?.username}</Link> el {new Date(session.date).toLocaleDateString()}
          </p>
          <LikeButton entityType="session" entityId={session.id} initialIsLiked={isLiked} initialLikeCount={likeCount || 0} isAuthenticated={!!user} />
          <ShareButton title="Cocinado en Mis Arroces" text={`Mira el resultado de ${session.user?.display_name}`} path={`/sessions/${session.id}`} />
        </div>
      </header>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Receta Original</p>
          <Link href={`/recipes/${session.recipe_id}`} className="font-medium hover:underline text-lg">{session.recipe?.name}</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {session.rating && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Valoración</p>
            <p className="text-lg font-bold text-primary">{"⭐".repeat(session.rating)}</p>
          </div>
        )}
        {session.socarrat_level && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Socarrat</p>
            <p className="text-lg font-medium">Nivel {session.socarrat_level}</p>
          </div>
        )}
        {session.actual_servings && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Raciones reales</p>
            <p className="text-lg font-medium">{session.actual_servings}</p>
          </div>
        )}
      </div>

      {session.modifications && (
        <section className="space-y-2">
          <h2 className="font-bold text-lg">Cambios sobre la receta</h2>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="whitespace-pre-wrap">{session.modifications}</p>
          </div>
        </section>
      )}

      {session.notes && (
        <section className="space-y-2">
          <h2 className="font-bold text-lg">Notas personales</h2>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="whitespace-pre-wrap">{session.notes}</p>
          </div>
        </section>
      )}

      <div className="pt-8 border-t border-border mt-8">
        <CommentSection entityType="session" entityId={session.id} comments={comments || []} currentUserId={user?.id || null} allowComments={session.allow_comments} />
      </div>
    </div>
  )
}

