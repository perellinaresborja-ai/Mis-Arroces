"use server"

import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 20

export async function fetchFeedPage(pageIndex: number = 0, existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser !== undefined ? existingUser : (await supabase.auth.getUser()).data.user

  const offset = pageIndex * PAGE_SIZE

  let query = supabase.from("feed_items").select("*").order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  let followStatusMap: Record<string, string> = {}
  let excludedUserIds: string[] = []

  if (user) {
    const [followsRes, blocksRes, mutesRes] = await Promise.all([
      supabase.from("follows").select("following_id, status").eq("follower_id", user.id),
      supabase.from("blocks").select("blocker_id, blocked_id").or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
      supabase.from("user_mutes").select("muted_id").eq("muter_id", user.id)
    ])

    const follows = followsRes.data || []
    const blocks = blocksRes.data || []
    const mutes = mutesRes.data || []

    const followingIds = follows.filter(f => f.status === 'ACCEPTED').map(f => f.following_id)
    followStatusMap = follows.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {})
    const allowedAuthors = [user.id, ...followingIds].map(id => `"${id}"`).join(",")

    // Gather excluded IDs
    const blockedIds = blocks.map((b: any) => b.blocker_id === user.id ? b.blocked_id : b.blocker_id)
    const mutedIds = mutes.map((m: any) => m.muted_id)
    excludedUserIds = Array.from(new Set([...blockedIds, ...mutedIds]))

    query = query.or(`visibility.eq.PUBLIC,user_id.eq.${user.id},and(visibility.eq.FOLLOWERS,user_id.in.(${allowedAuthors}))`)
  } else {
    query = query.eq("visibility", "PUBLIC")
  }

  const { data: feedItems } = await query

  const postIds = feedItems?.filter(i => i.entity_type === 'post').map(i => i.entity_id).filter((id): id is string => id !== null) || []
  const recipeIds = feedItems?.filter(i => i.entity_type === 'recipe').map(i => i.entity_id).filter((id): id is string => id !== null) || []
  const sessionIds = feedItems?.filter(i => i.entity_type === 'session').map(i => i.entity_id).filter((id): id is string => id !== null) || []

  const [postsRes, recipesRes, sessionsRes, commentsRes] = await Promise.all([
    postIds.length > 0 ? supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(id, storage_path, media_type)), recipe:recipes(id, name)`).in("id", postIds) : { data: [] },
    recipeIds.length > 0 ? supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(id, storage_path, media_type))`).in("id", recipeIds) : { data: [] },
    sessionIds.length > 0 ? supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(id, storage_path, media_type)), recipe:recipes(id, name)`).in("id", sessionIds) : { data: [] },
    supabase.from("feed_metrics").select("*").in("entity_id", feedItems?.map(i => i.entity_id).filter(Boolean) || [])
  ])

  const posts = postsRes.data || []
  const recipes = recipesRes.data || []
  const sessions = sessionsRes.data || []

  // Load collaborators and tagged users for posts
  if (posts.length > 0) {
    try {
      const postCollaboratorIds = posts.map((p: any) => p.collaborator_id).filter(Boolean)
      const [collabRes, taggedRes] = await Promise.all([
        postCollaboratorIds.length > 0
          ? supabase.from("profiles").select("id, username, display_name").in("id", postCollaboratorIds)
          : { data: [] },
        postIds.length > 0
          ? supabase.from("tagged_users").select("entity_id, tagged:profiles!tagged_users_tagged_id_fkey(id, username, display_name)").eq("entity_type", "social_post").in("entity_id", postIds)
          : { data: [] }
      ])

      const collabMap = (collabRes.data || []).reduce((acc: any, c: any) => { acc[c.id] = c; return acc }, {})
      const taggedMap = (taggedRes.data || []).reduce((acc: any, t: any) => {
        if (!acc[t.entity_id]) acc[t.entity_id] = []
        if (t.tagged) acc[t.entity_id].push(t.tagged)
        return acc
      }, {})

      posts.forEach((p: any) => {
        p.collaborator = p.collaborator_id ? collabMap[p.collaborator_id] || null : null
        p.tagged_users = taggedMap[p.id] || []
      })
    } catch (e) {
      console.error("Error attaching feed post metadata:", e)
    }
  }

  const metricsMap = (commentsRes?.data || []).reduce((acc: any, val: any) => {
    acc[`${val.entity_type}:${val.entity_id}`] = { 
      likeCount: val.like_count || 0, 
      commentCount: val.comment_count || 0,
      groupedReactions: val.grouped_reactions || {},
      myReaction: val.current_user_reaction || null
    };
    return acc;
  }, {});

  const enriched = feedItems?.filter(item => item.entity_id).map(item => {
    const entityId = item.entity_id as string;
    const metricsKey = `${item.entity_type}:${entityId}`;
    let data: any = null;

    if (item.entity_type === 'post') {
      data = posts.find(p => p.id === entityId)
    } else if (item.entity_type === 'recipe') {
      data = recipes.find(r => r.id === entityId)
    } else if (item.entity_type === 'session') {
      data = sessions.find(s => s.id === entityId)
    }
    
    if (!data) return null;

    const authorId = data.author?.id || data.author_id || data.owner_id || data.user_id;
    if (authorId !== user?.id && excludedUserIds.includes(authorId)) {
      return null;
    }

    return { 
      ...item, 
      data, 
      reactions: undefined, 
      initialGroupedReactions: metricsMap[metricsKey]?.groupedReactions || {}, 
      initialMyReaction: metricsMap[metricsKey]?.myReaction || null, 
      commentCount: metricsMap[metricsKey]?.commentCount || 0, 
      followStatus: typeof followStatusMap !== "undefined" ? followStatusMap[authorId] || null : null 
    }
  }).filter(Boolean) || []

  return enriched
}


