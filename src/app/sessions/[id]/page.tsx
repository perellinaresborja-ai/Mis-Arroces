import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { formatRelativeTime, cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { MediaCarousel } from "@/components/domain/MediaCarousel"
import { LikeButton } from "@/components/domain/LikeButton"
import { ShareButton } from "@/components/domain/ShareButton"
import { CommentSection } from "@/components/domain/CommentSection"
import { ChevronLeft } from "lucide-react"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from("cooking_sessions")
    .select(`
      *,
      author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      recipe:recipes(id, name, owner_id),
      session_media(display_order, media:media_assets(id, storage_path))
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (!session) notFound()

  // Verify visibility
  if (session.visibility === 'PRIVATE' && session.user_id !== user?.id) notFound()
  if (session.visibility === 'FOLLOWERS' && session.user_id !== user?.id) {
    if (!user) notFound()
    const { data: follows } = await supabase.from("follows").select("status").eq("follower_id", user.id).eq("following_id", session.user_id).single()
    if (follows?.status !== 'ACCEPTED') notFound()
  }

  // Fetch likes & comments
  const [likesRes, commentsRes] = await Promise.all([
    supabase.from("session_likes").select("user_id").eq("session_id", session.id),
    supabase.from("session_comments").select(`
      *,
      author:profiles!session_comments_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))
    `).eq("session_id", session.id).eq("is_deleted", false).order("created_at", { ascending: true })
  ])

  const likeCount = likesRes.data?.length || 0
  const isLiked = user ? !!likesRes.data?.find(l => l.user_id === user.id) : false
  const comments = commentsRes.data || []

  const media = session.session_media?.map((m: any) => m.media).filter(Boolean).sort((a: any, b: any) => a.display_order - b.display_order) || []

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto h-14 px-4 flex items-center justify-between">
          <Link href={`/recipes/${session.recipe_id}`} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <span className="font-bold text-sm">Resultado</span>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          
          <div className="p-4 flex items-center justify-between">
            <Link href={`/@${session.author?.username}`} className="flex items-center gap-3 group">
              <ProfileAvatar avatarUrl={session.author?.avatar?.storage_path || null} username={session.author?.display_name || session.author?.username} />
              <div>
                <p className="font-bold text-sm group-hover:underline">{session.author?.display_name}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(session.created_at)}</p>
              </div>
            </Link>
          </div>

          {media.length > 0 && (
            <div className="w-full aspect-square">
              <MediaCarousel items={media} bucket="sessions" />
            </div>
          )}

          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <div className="flex gap-4">
                <span>Valoración: {session.rating}/5</span>
                {session.socarrat_level && <span>Socarrat: {session.socarrat_level}/5</span>}
              </div>
            </div>

            {session.notes && <p className="text-sm whitespace-pre-wrap">{session.notes}</p>}
            {session.modifications && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border text-sm">
                <strong>Cambios:</strong> <span className="text-muted-foreground">{session.modifications}</span>
              </div>
            )}

            <div className="flex items-center gap-6 pt-2">
              <LikeButton entityType="session" entityId={session.id} initialIsLiked={isLiked} initialLikeCount={likeCount} isAuthenticated={!!user} />
              <ShareButton title={`Resultado de ${session.author?.display_name}`} text="Mira esta sesión" path={`/sessions/${session.id}`} />
            </div>
            
            <div className="pt-4 border-t border-border mt-4">
              <h3 className="font-bold mb-4">Comentarios</h3>
              <CommentSection entityType="session" entityId={session.id} comments={comments} currentUserId={user?.id || null} allowComments={true} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
