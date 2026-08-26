// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { ShortsFeed } from "./ShortsFeed"
import { BottomNav } from "@/components/domain/BottomNav"

export default async function ShortsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch shorts with media and author
  const { data: shorts } = await supabase
    .from("shorts")
    .select(`
      *,
      author:profiles!shorts_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
      short_media(display_order, media:media_assets(storage_path)),
      likes:short_likes(user_id),
      comments:short_comments(id)
    `)
    .eq("visibility", "PUBLIC")
    .order("created_at", { ascending: false })
    .limit(20)

  const formattedShorts = (shorts || []).map(s => ({
    ...s,
    like_count: s.likes?.length || 0,
    user_liked: user ? s.likes?.some((l: any) => l.user_id === user.id) : false,
    comment_count: s.comments?.length || 0
  }))

  return (
    <div className="bg-black text-white h-screen overflow-hidden flex flex-col">
      <ShortsFeed shorts={formattedShorts} currentUserId={user?.id || null} />
      <BottomNav />
    </div>
  )
}
