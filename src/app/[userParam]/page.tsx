// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { getProfileHighlights } from "@/app/actions/highlights"
import { getArchivedStories } from "@/app/actions/stories"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProfileGridCard } from "@/components/domain/ProfileGridCard"
import { ProfileHighlightsClient } from "@/components/domain/ProfileHighlightsClient"
import { FollowsModal } from "@/components/domain/FollowsModal"
import { FeedCard } from "@/components/domain/FeedCard"
import { MessageCircle, Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon, ShoppingCart, BarChart2 } from "lucide-react"
import { ShareButton } from "@/components/domain/ShareButton"
import { ProfileShareModal } from "@/components/domain/ProfileShareModal"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { ProfileFollowButton } from "@/components/domain/ProfileFollowButton"

import { ViewTracker } from "@/components/domain/ViewTracker"

export async function generateMetadata({ params }: { params: Promise<{ userParam: string }> }) {
  const resolvedParams = await params;
  const rawParam = decodeURIComponent(resolvedParams.userParam);
  const username = rawParam.startsWith("@") ? rawParam.substring(1) : rawParam;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("display_name, bio, avatar:media_assets!fk_profiles_avatar(storage_path)").eq("username", username).single();

  if (!profile) return {};

  const avatarUrl = profile.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${profile.avatar.storage_path}`
    : "/logopaellaicono.png";

  const title = profile.display_name ? `${profile.display_name} (@${username}) | Mis Arroces` : `@${username} | Mis Arroces`;
  const description = profile.bio || `Descubre las elaboraciones, recetas y paellas de @${username} en Mis Arroces.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [avatarUrl]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatarUrl]
    }
  };
}

export default async function PublicProfilePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ userParam: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const tab = resolvedSearchParams?.tab || 'posts'
  const rawParam = decodeURIComponent(resolvedParams.userParam)
  const username = rawParam.startsWith("@") ? rawParam.substring(1) : rawParam

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile WITH the avatar relation just like comments do
  let { data: profile, error: profileError } = await supabase.from("profiles")
    .select(`*, avatar:media_assets!fk_profiles_avatar(storage_path), cover:media_assets!fk_profiles_cover(storage_path)`)
    .eq("username", username).single()
  
  if (profileError && profileError.code === 'PGRST116') {
    // try to find in aliases
    // @ts-ignore
    const { data: alias } = await supabase.from("username_aliases").select("profile_id, profiles(username)").eq("username", username).single()
    if (alias && alias.profiles?.username) {
      redirect(`/@${alias.profiles.username}`)
    }
  }

  if (profileError) console.error("Profile fetch error:", profileError)
  if (!profile) notFound()

  const avatarUrl = profile.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${profile.avatar.storage_path}`
    : null

  const isSelf = user?.id === profile.id

  let followStatus = null
  if (user && !isSelf) {
    const { data: follow } = await supabase.from("follows").select("status").match({ follower_id: user.id, following_id: profile.id }).single()
    if (follow) followStatus = follow.status
  }

  const canViewPrivate = isSelf || (profile.privacy_level === "PUBLIC") || (followStatus === "ACCEPTED")
  const visibilityFilter = isSelf ? ["PUBLIC", "PRIVATE", "FOLLOWERS"] : ["PUBLIC", "FOLLOWERS"]

  
  let highlights: any[] = []
  let archivedStories: any[] = []
  if (isSelf || canViewPrivate) {
    highlights = await getProfileHighlights(profile.id)
  }
  if (isSelf) {
    archivedStories = await getArchivedStories()
  }
  let hasActiveShoppingItems = false
  if (isSelf) {
    const { data: list } = await supabase
      .from('shopping_lists')
      .select('shopping_list_items(id, is_checked)')
      .eq('user_id', user.id)
      .single()
    if (list && list.shopping_list_items) {
      hasActiveShoppingItems = list.shopping_list_items.some((i: any) => !i.is_checked)
    }
  }

  // Counts
  const [
    { count: followersCount }, 
    { count: followingCount }
  ] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id).eq("status", "ACCEPTED"),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id).eq("status", "ACCEPTED")
  ])

  // Fetch "Mis Elaboraciones" (Recipes + Sessions + Posts) in one go if they can view
  let feedItems: any[] = []

  if (canViewPrivate) {
    let qRecipes = supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(id, storage_path))`).eq("owner_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter)
    let qSessions = supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(id, storage_path)), recipe:recipes(id, name)`).eq("user_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter)
    let qPosts = supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(id, storage_path)), recipe:recipes(id, name)`).eq("author_id", profile.id).in("visibility", visibilityFilter)

    const [recRes, sesRes, postRes] = await Promise.all([qRecipes, qSessions, qPosts])
    
    const recipes = (recRes.data || []).map((r: any) => ({ ...r, entity_type: 'recipe', sort_date: new Date(r.created_at).getTime() }))
    const sessions = (sesRes.data || []).map((s: any) => ({ ...s, entity_type: 'session', sort_date: new Date(s.date || s.created_at).getTime() }))
    const posts = (postRes.data || []).map((p: any) => ({ ...p, entity_type: 'post', sort_date: new Date(p.created_at).getTime() }))

    feedItems = [...recipes, ...sessions, ...posts].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return b.sort_date - a.sort_date;
    })

    if (feedItems.length > 0) {
      // Split items by type to fetch likes and comments
      const recipeIds = feedItems.filter(i => i.entity_type === 'recipe').map(i => i.id)
      const sessionIds = feedItems.filter(i => i.entity_type === 'session').map(i => i.id)
      const postIds = feedItems.filter(i => i.entity_type === 'post').map(i => i.id)

      const queries = []
      if (recipeIds.length > 0) {
        queries.push(supabase.from("recipe_likes").select("recipe_id, emoji, user_id").in("recipe_id", recipeIds).then(r => ({ type: 'recipe', likes: r.data })))
        queries.push(supabase.from("recipe_comments").select("recipe_id").eq("is_deleted", false).in("recipe_id", recipeIds).then(r => ({ type: 'recipe', comments: r.data })))
      }
      if (sessionIds.length > 0) {
        queries.push(supabase.from("session_likes").select("session_id, emoji, user_id").in("session_id", sessionIds).then(r => ({ type: 'session', likes: r.data })))
        queries.push(supabase.from("session_comments").select("session_id").eq("is_deleted", false).in("session_id", sessionIds).then(r => ({ type: 'session', comments: r.data })))
      }
      if (postIds.length > 0) {
        queries.push(supabase.from("post_likes").select("post_id, emoji, user_id").in("post_id", postIds).then(r => ({ type: 'post', likes: r.data })))
        queries.push(supabase.from("post_comments").select("post_id").eq("is_deleted", false).in("post_id", postIds).then(r => ({ type: 'post', comments: r.data })))
      }

      const results = await Promise.all(queries)
      
      const counts = { likes: {} as any, reactions: {} as any, comments: {} as any }
      results.forEach((res: any) => {
        if (res.likes) res.likes.forEach((l: any) => { 
          const id = l.recipe_id || l.session_id || l.post_id; 
          counts.likes[id] = (counts.likes[id] || 0) + 1;
          if (!counts.reactions[id]) counts.reactions[id] = [];
          counts.reactions[id].push({ emoji: l.emoji, user_id: l.user_id })
        })
        if (res.comments) res.comments.forEach((c: any) => { const id = c.recipe_id || c.session_id || c.post_id; counts.comments[id] = (counts.comments[id] || 0) + 1 })
      })

      feedItems = feedItems.map(item => ({
        ...item,
        reactions: counts.reactions[item.id] || [],
        likeCount: counts.likes[item.id] || 0,
        commentCount: counts.comments[item.id] || 0
      }))
    }
  }

  const coverUrl = profile.cover?.storage_path
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${profile.cover.storage_path}`
    : null;
  return (
    <div className="pb-24 md:pb-8 bg-background min-h-screen overflow-x-hidden max-w-[100vw]">
      {profile.id && profile.id !== user?.id && <ViewTracker eventType="PROFILE_VIEW" entityType="PROFILE" entityId={profile.id} ownerId={profile.id} />}
      <header className="mb-6 relative">
        {/* COVER FULL WIDTH */}
        <div className="w-full bg-muted relative z-0 overflow-hidden rounded-xl" style={{ height: '325px' }}>
          {coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-muted/50 to-muted-foreground/5" />
          )}
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <ProfileShareModal username={profile.username} display_name={profile.display_name} path={`/@${profile.username}`} />
            {isSelf && (
              <Link href="/settings" className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm" title="Configuración">
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center pb-4 w-full" style={{ marginTop: '-100px' }}>
            {/* AVATAR OVERLAP */}
            <div className="aspect-square shrink-0 bg-background rounded-full p-1 shadow-sm relative" style={{ width: '200px', height: '200px' }}>
            <ProfileAvatar avatarUrl={avatarUrl} username={profile.username} />
          </div>
          
          <div className="mt-3 text-center w-full">
            {profile.display_name ? (
              <>
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-0.5">
                  <p className="text-[15px]">@{profile.username}</p>
                  {profile.privacy_level === 'PRIVATE' && <Lock className="w-3.5 h-3.5" />}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                {profile.privacy_level === 'PRIVATE' && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
            )}
          </div>

          {profile.bio && <p className="text-[15px] mt-3 max-w-md text-center whitespace-pre-wrap">{profile.bio}</p>}
          {(profile as any).website && (
            <a 
              href={(profile as any).website.startsWith('http') ? (profile as any).website : `https://${(profile as any).website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-3 text-[14px] font-medium text-primary hover:underline max-w-md"
            >
              <LinkIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{(profile as any).website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </a>
          )}
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm w-full">
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground text-[17px] leading-none">{feedItems.length}</span>
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider mt-1">Elaboraciones</span>
            </div>
            <FollowsModal 
              targetUserId={profile.id} 
              currentUserId={user?.id || null} 
              followersCount={followersCount || 0} 
              followingCount={followingCount || 0} 
            />
          </div>

          {!isSelf && (
              <div className="mt-5 flex justify-center items-center gap-2">
                <a href={`/messages?to=${profile.id}`} className="inline-flex items-center justify-center rounded-full text-sm font-bold border border-border bg-card hover:bg-muted h-10 px-4 shadow-sm">
                  <MessageCircle className="w-4 h-4 mr-2"/> Mensaje
                </a>
                {!user ? (
                  <ProfileFollowButton isAuthenticated={false} followStatus={null} targetId={profile.id} isPrivate={profile.privacy_level === "PRIVATE"} />
                ) : (
                  <form action={async () => {
                    "use server"
                    const { toggleFollow } = await import("@/app/actions/social")
                    await toggleFollow(profile.id, profile.privacy_level === "PRIVATE", followStatus)
                  }}>
                    <Button 
                      type="submit"
                      variant={followStatus === 'ACCEPTED' ? 'outline' : followStatus === 'PENDING' ? 'secondary' : 'default'} 
                      className="min-w-[120px] rounded-full font-bold shadow-sm"
                    >
                      {followStatus === 'ACCEPTED' ? 'Siguiendo' : followStatus === 'PENDING' ? 'Solicitud enviada' : 'Seguir'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          
          
        </div>
      </header>
        {(isSelf || (canViewPrivate && highlights.length > 0)) && (
          <div className="w-full px-4 mb-4">
            <ProfileHighlightsClient highlights={highlights} archivedStories={archivedStories} isMe={isSelf} />
          </div>
        )}
        <div className="px-1 md:px-0 mx-auto pb-6 w-full">
        <div className="flex justify-center border-t border-border mb-4">
          <Link href="?tab=posts" scroll={false} className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${tab === 'posts' ? 'text-foreground border-t-[3px] border-primary -mt-[2px]' : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'}`}>
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Publicaciones</span>
          </Link>
          <Link href="?tab=videos" scroll={false} className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${tab === 'videos' ? 'text-foreground border-t-[3px] border-primary -mt-[2px]' : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'}`}>
            <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Vídeos</span>
          </Link>
          <Link href="?tab=tagged" scroll={false} className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${tab === 'tagged' ? 'text-foreground border-t-[3px] border-primary -mt-[2px]' : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'}`}>
            <UserSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Etiquetas</span>
          </Link>
        </div>

        {!canViewPrivate && profile.privacy_level === "PRIVATE" ? (
          <div className="text-center py-16 border border-border rounded-xl bg-card mx-2">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Esta cuenta es privada</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Sigue a este usuario para ver sus elaboraciones.</p>
          </div>
        ) : (
          <div>
            {tab !== 'posts' && (
              <div className="text-center py-16 text-muted-foreground">
                <p>Próximamente: Aún no hay contenido en esta sección.</p>
              </div>
            )}

            {tab === 'posts' && feedItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No hay elaboraciones publicadas todavía.</p>
              </div>
            )}

            {tab === 'posts' && feedItems.length > 0 && (
              <div className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full">
                {feedItems.map(item => (
                  <ProfileGridCard 
                    key={`${item.entity_type}-${item.id}`} 
                    item={item} 
                    currentUserId={user?.id || null}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

