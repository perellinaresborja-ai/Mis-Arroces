// @ts-nocheck
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { getProfileHighlights } from "@/app/actions/highlights"
import { getArchivedStories, fetchUserActiveStories } from "@/app/actions/stories"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProfileGridCard } from "@/components/domain/ProfileGridCard"
import { ProfileTabsClient } from "@/components/domain/ProfileTabsClient"
import { ProfileHighlightsClient } from "@/components/domain/ProfileHighlightsClient"
import { FollowsModal } from "@/components/domain/FollowsModal"
import { FeedCard } from "@/components/domain/FeedCard"
import { MessageCircle, Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon, ShoppingCart, BarChart2 } from "lucide-react"
import { ShareButton } from "@/components/domain/ShareButton"
import { ProfileShareModal } from "@/components/domain/ProfileShareModal"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { ProfileFollowButton } from "@/components/domain/ProfileFollowButton"
import { ReportButton } from "@/components/domain/ReportButton"
import { FounderCardModal } from "@/components/domain/FounderCardModal"
import { ViewTracker } from "@/components/domain/ViewTracker"

const getProfileData = cache(async (username: string) => {
  try {
    const cleanUser = username.replace(/^@+/, '')
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select(`*, avatar:media_assets!fk_profiles_avatar(storage_path), cover:media_assets!fk_profiles_cover(storage_path)`)
      .ilike("username", cleanUser)
      .maybeSingle()

    if (profile) {
      return { profile, aliasRedirect: null }
    }

    // Check aliases
    const { data: alias } = await supabase
      .from("username_aliases" as any)
      .select("profile_id, profiles(username)")
      .ilike("username", cleanUser)
      .maybeSingle()

    if (alias && (alias as any).profiles?.username) {
      return { profile: null, aliasRedirect: (alias as any).profiles.username }
    }

    return { profile: null, aliasRedirect: null }
  } catch (err) {
    console.error("Error in getProfileData:", err)
    return { profile: null, aliasRedirect: null }
  }
})

export async function generateMetadata({ params }: { params: Promise<{ userParam: string }> }) {
  const resolvedParams = await params;
  const rawParam = decodeURIComponent(resolvedParams.userParam);
  const username = rawParam.replace(/^@+/, '');

  const { profile } = await getProfileData(username);

  if (!profile) {
    return {
      title: "Perfil no encontrado | misarroces",
    };
  }

  const isPublic = profile.privacy_level === "PUBLIC";
  const avatarUrl = profile.avatar?.storage_path 
    ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${profile.avatar.storage_path}`
    : "https://www.misarroces.es/logopngver.webp";

  const canonicalUrl = `https://www.misarroces.es/@${username}`;
  const displayName = profile.display_name || username;
  const title = `${displayName} (@${username})`;
  const description = profile.bio || `Descubre las elaboraciones, recetas y paellas de @${username} en misarroces.`;

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
      type: "profile",
      siteName: "misarroces",
      images: [{
        url: avatarUrl,
        alt: `@${username}`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | misarroces`,
      description,
      images: [avatarUrl],
    },
    robots: {
      index: isPublic,
      follow: isPublic,
      googleBot: {
        index: isPublic,
        follow: isPublic,
        'max-image-preview': 'large',
      },
    },
  };
}

async function enrichWithCounts(supabase: any, items: any[]) {
  if (!items || items.length === 0) return items;

  const recipeIds = items.filter(i => i.entity_type === 'recipe').map(i => i.id);
  const sessionIds = items.filter(i => i.entity_type === 'session').map(i => i.id);
  const postIds = items.filter(i => i.entity_type === 'post').map(i => i.id);

  const queries = [];
  if (recipeIds.length > 0) {
    queries.push(supabase.from("recipe_likes").select("recipe_id, emoji, user_id").in("recipe_id", recipeIds).then((r: any) => ({ type: 'recipe', likes: r.data || [] }), () => ({ type: 'recipe', likes: [] })));
    queries.push(supabase.from("recipe_comments").select("recipe_id").eq("is_deleted", false).in("recipe_id", recipeIds).then((r: any) => ({ type: 'recipe', comments: r.data || [] }), () => ({ type: 'recipe', comments: [] })));
  }
  if (sessionIds.length > 0) {
    queries.push(supabase.from("session_likes").select("session_id, emoji, user_id").in("session_id", sessionIds).then((r: any) => ({ type: 'session', likes: r.data || [] }), () => ({ type: 'session', likes: [] })));
    queries.push(supabase.from("session_comments").select("session_id").eq("is_deleted", false).in("session_id", sessionIds).then((r: any) => ({ type: 'session', comments: r.data || [] }), () => ({ type: 'session', comments: [] })));
  }
  if (postIds.length > 0) {
    queries.push(supabase.from("post_likes").select("post_id, emoji, user_id").in("post_id", postIds).then((r: any) => ({ type: 'post', likes: r.data || [] }), () => ({ type: 'post', likes: [] })));
    queries.push(supabase.from("post_comments").select("post_id").eq("is_deleted", false).in("post_id", postIds).then((r: any) => ({ type: 'post', comments: r.data || [] }), () => ({ type: 'post', comments: [] })));
  }

  const results = await Promise.all(queries);
  
  const counts = { likes: {} as any, reactions: {} as any, comments: {} as any };
  results.forEach((res: any) => {
    if (res.likes) res.likes.forEach((l: any) => { 
      const id = l.recipe_id || l.session_id || l.post_id; 
      counts.likes[id] = (counts.likes[id] || 0) + 1;
      if (!counts.reactions[id]) counts.reactions[id] = [];
      counts.reactions[id].push({ emoji: l.emoji, user_id: l.user_id });
    });
    if (res.comments) res.comments.forEach((c: any) => { 
      const id = c.recipe_id || c.session_id || c.post_id; 
      counts.comments[id] = (counts.comments[id] || 0) + 1;
    });
  });

  return items.map(item => ({
    ...item,
    reactions: counts.reactions[item.id] || [],
    likeCount: counts.likes[item.id] || 0,
    commentCount: counts.comments[item.id] || 0
  }));
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
  const username = rawParam.replace(/^@+/, '')

  const supabase = await createClient()
  
  const [authRes, profileData] = await Promise.all([
    supabase.auth.getUser(),
    getProfileData(username)
  ])

  if (profileData.aliasRedirect) {
    redirect(`/@${profileData.aliasRedirect}`)
  }

  const profile = profileData.profile
  if (!profile) notFound()

  const user = authRes.data?.user
  const isSelf = user?.id === profile.id

  // If visiting own profile, followStatus is null; otherwise fetch follow status
  const followPromise = (!isSelf && user)
    ? supabase.from("follows").select("status").match({ follower_id: user.id, following_id: profile.id }).maybeSingle().then(r => r, () => ({ data: null }))
    : Promise.resolve({ data: null })

  // If isSelf or PUBLIC, canViewPrivate is known true upfront!
  const isPublicProfile = profile.privacy_level === "PUBLIC"
  const canViewImmediately = isSelf || isPublicProfile
  const visibilityFilter = isSelf ? ["PUBLIC", "PRIVATE", "FOLLOWERS"] : ["PUBLIC", "FOLLOWERS"]

  // Parallel batch: Metadata, follows, stories, and entities (if immediately viewable)
  const [
    founderRes,
    identityRes,
    followRes,
    followersRes,
    followingRes,
    highlightsRes,
    archivedStoriesRes,
    activeStoryGroupRes,
    recipesRes,
    sessionsRes,
    postsRes
  ] = await Promise.all([
    // Founder number
    supabase.from("founders" as any).select("founder_number").eq("user_id", profile.id).maybeSingle().then(r => r, () => ({ data: null })),
    // Public code
    supabase.from("user_identities" as any).select("public_code").eq("user_id", profile.id).maybeSingle().then(r => r, () => ({ data: null })),
    // Follow status
    followPromise,
    // Followers count
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id).eq("status", "ACCEPTED").then(r => r, () => ({ count: 0 })),
    // Following count
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id).eq("status", "ACCEPTED").then(r => r, () => ({ count: 0 })),
    // Highlights
    canViewImmediately ? getProfileHighlights(profile.id).then(r => r, () => []) : Promise.resolve([]),
    // Archived stories
    isSelf ? getArchivedStories().then(r => r, () => []) : Promise.resolve([]),
    // Active stories
    fetchUserActiveStories(profile.id).then(r => r, () => null),
    // Recipes (if canViewImmediately)
    canViewImmediately
      ? supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(*))`).eq("owner_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then(r => r, () => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    // Sessions (if canViewImmediately)
    canViewImmediately
      ? supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).eq("user_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then(r => r, () => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    // Posts (if canViewImmediately)
    canViewImmediately
      ? supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).eq("author_id", profile.id).in("visibility", visibilityFilter).then(r => r, () => ({ data: [] }))
      : Promise.resolve({ data: [] })
  ])

  const founderNumber = typeof (founderRes?.data as any)?.founder_number === "number" ? (founderRes.data as any).founder_number : null
  const publicCode = (identityRes?.data as any)?.public_code || undefined
  const followStatus = followRes?.data?.status || null
  const canViewPrivate = canViewImmediately || (followStatus === "ACCEPTED")

  let highlights = highlightsRes || []
  if (!canViewImmediately && canViewPrivate) {
    highlights = await getProfileHighlights(profile.id).then(r => r, () => [])
  }

  const followersCount = followersRes?.count || 0
  const followingCount = followingRes?.count || 0
  const archivedStories = archivedStoriesRes || []
  const activeStoryGroup = activeStoryGroupRes

  let recData = recipesRes?.data || []
  let sesData = sessionsRes?.data || []
  let postData = postsRes?.data || []

  // If was private but followStatus is ACCEPTED, fetch entities now
  if (!canViewImmediately && canViewPrivate) {
    const [extraRec, extraSes, extraPost] = await Promise.all([
      supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(*))`).eq("owner_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then(r => r, () => ({ data: [] })),
      supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).eq("user_id", profile.id).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then(r => r, () => ({ data: [] })),
      supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).eq("author_id", profile.id).in("visibility", visibilityFilter).then(r => r, () => ({ data: [] }))
    ])
    recData = extraRec.data || []
    sesData = extraSes.data || []
    postData = extraPost.data || []
  }

  let feedItems: any[] = []
  if (canViewPrivate) {
    const recipes = recData.map((r: any) => ({ ...r, entity_type: 'recipe', sort_date: new Date(r.created_at).getTime() }))
    const sessions = sesData.map((s: any) => ({ ...s, entity_type: 'session', sort_date: new Date(s.date || s.created_at).getTime() }))
    const posts = postData.map((p: any) => ({ ...p, entity_type: 'post', sort_date: new Date(p.created_at).getTime() }))

    feedItems = [...recipes, ...sessions, ...posts].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return b.sort_date - a.sort_date;
    })

    if (feedItems.length > 0) {
      feedItems = await enrichWithCounts(supabase, feedItems)
    }
  }

  const videoItems = feedItems
    .filter(item => {
      const mediaList = item.recipe_media || item.session_media || item.post_media || []
      return mediaList.some((m: any) => m.media?.media_type === 'VIDEO' || m.media?.storage_path?.match(/\.(mp4|webm|mov)$/i))
    })
    .map(item => {
      const mediaKey = item.recipe_media ? 'recipe_media' : item.session_media ? 'session_media' : 'post_media';
      const list = item[mediaKey] || [];
      const videoFirst = [...list].sort((a: any, b: any) => {
        const aIsVideo = a.media?.media_type === 'VIDEO' || a.media?.storage_path?.match(/\.(mp4|webm|mov)$/i);
        const bIsVideo = b.media?.media_type === 'VIDEO' || b.media?.storage_path?.match(/\.(mp4|webm|mov)$/i);
        if (aIsVideo && !bIsVideo) return -1;
        if (!aIsVideo && bIsVideo) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      });
      return {
        ...item,
        [mediaKey]: videoFirst
      };
    });

  let taggedItems: any[] = []
  if (canViewPrivate) {
    const [taggedRes, mentionsRes] = await Promise.all([
      supabase
        .from("tagged_users")
        .select("entity_type, entity_id, author_id, created_at")
        .eq("tagged_id", profile.id)
        .neq("author_id", profile.id)
        .then((r: any) => r, () => ({ data: [] })),
      supabase
        .from("mentions")
        .select("entity_type, entity_id, actor_id, created_at")
        .eq("mentioned_id", profile.id)
        .neq("actor_id", profile.id)
        .in("entity_type", ["recipe", "cooking_session", "social_post"])
        .then((r: any) => r, () => ({ data: [] }))
    ]);

    const seenEntityKeys = new Set<string>();
    const taggedRefs: { entity_type: string, entity_id: string }[] = [];

    const addRef = (entityType: string, entityId: string) => {
      const key = `${entityType}-${entityId}`;
      if (!seenEntityKeys.has(key)) {
        seenEntityKeys.add(key);
        taggedRefs.push({ entity_type: entityType, entity_id: entityId });
      }
    };

    (taggedRes?.data || []).forEach((t: any) => addRef(t.entity_type, t.entity_id));
    (mentionsRes?.data || []).forEach((m: any) => addRef(m.entity_type, m.entity_id));

    const taggedRecipeIds = taggedRefs.filter(r => r.entity_type === 'recipe').map(r => r.entity_id);
    const taggedSessionIds = taggedRefs.filter(r => r.entity_type === 'cooking_session' || r.entity_type === 'session').map(r => r.entity_id);
    const taggedPostIds = taggedRefs.filter(r => r.entity_type === 'social_post' || r.entity_type === 'post').map(r => r.entity_id);

    if (taggedRecipeIds.length > 0 || taggedSessionIds.length > 0 || taggedPostIds.length > 0) {
      const [tRecipesRes, tSessionsRes, tPostsRes] = await Promise.all([
        taggedRecipeIds.length > 0
          ? supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(*))`).in("id", taggedRecipeIds).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then((r: any) => r, () => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        taggedSessionIds.length > 0
          ? supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).in("id", taggedSessionIds).eq("status", "PUBLISHED").in("visibility", visibilityFilter).then((r: any) => r, () => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        taggedPostIds.length > 0
          ? supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(*)), recipe:recipes(id, name)`).in("id", taggedPostIds).in("visibility", visibilityFilter).then((r: any) => r, () => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      const tRecipes = (tRecipesRes.data || []).map((r: any) => ({ ...r, entity_type: 'recipe', sort_date: new Date(r.created_at).getTime() }));
      const tSessions = (tSessionsRes.data || []).map((s: any) => ({ ...s, entity_type: 'session', sort_date: new Date(s.date || s.created_at).getTime() }));
      const tPosts = (tPostsRes.data || []).map((p: any) => ({ ...p, entity_type: 'post', sort_date: new Date(p.created_at).getTime() }));

      taggedItems = [...tRecipes, ...tSessions, ...tPosts].sort((a, b) => b.sort_date - a.sort_date);
      if (taggedItems.length > 0) {
        taggedItems = await enrichWithCounts(supabase, taggedItems);
      }
    }
  }

  const avatarUrl = profile.avatar?.storage_path 
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${profile.avatar.storage_path}`
    : null;

  const coverUrl = profile.cover?.storage_path
    ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${profile.cover.storage_path}`
    : null;

  return (
    <div className="pb-24 md:pb-8 bg-background min-h-screen overflow-x-hidden max-w-[100vw]">
      {profile.id && profile.id !== user?.id && <ViewTracker eventType="PROFILE_VIEW" entityType="PROFILE" entityId={profile.id} ownerId={profile.id} />}
      <header className="mb-6 relative">
        {/* COVER FULL WIDTH */}
        <div className="w-full bg-muted relative z-0 overflow-hidden rounded-2xl" style={{ height: '325px' }}>
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
            <ProfileAvatar 
              avatarUrl={avatarUrl} 
              username={profile.username} 
              activeStoryGroup={activeStoryGroup}
              isMe={isSelf}
              currentUser={user}
            />
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

          {founderNumber !== null && founderNumber >= 0 && founderNumber <= 99 && (
            <div className="mt-2.5 flex justify-center">
              <FounderCardModal
                username={profile.username}
                displayName={profile.display_name || profile.username}
                founderNumber={founderNumber}
                publicCode={publicCode}
                isSelf={isSelf}
              />
            </div>
          )}

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
                <Link href={`/messages?to=${profile.id}`} className="inline-flex items-center justify-center rounded-full text-sm font-bold border border-border bg-card hover:bg-muted h-10 px-4 shadow-sm">
                  <MessageCircle className="w-4 h-4 mr-2"/> Mensaje
                </Link>
                <ProfileFollowButton 
                  isAuthenticated={!!user} 
                  followStatus={followStatus} 
                  targetId={profile.id} 
                  isPrivate={profile.privacy_level === "PRIVATE"} 
                />
                <ReportButton
                  targetType="USER"
                  targetId={profile.id}
                  reportedUserId={profile.id}
                  contentSnapshot={{
                    username: profile.username,
                    display_name: profile.display_name,
                    id: profile.id
                  }}
                  title="Reportar perfil"
                  variant="icon"
                  label="Reportar perfil"
                  isAuthenticated={!!user}
                  className="h-10 w-10 border border-border bg-card shadow-sm flex items-center justify-center"
                />
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
          {!canViewPrivate && profile.privacy_level === "PRIVATE" ? (
            <div className="text-center py-16 border border-border rounded-2xl bg-card mx-2">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Esta cuenta es privada</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Sigue a este usuario para ver sus elaboraciones.</p>
            </div>
          ) : (
            <ProfileTabsClient
              initialTab={tab}
              postItems={feedItems}
              videoItems={videoItems}
              taggedItems={taggedItems}
              currentUserId={user?.id || null}
            />
          )}
        </div>
    </div>
  )
}

