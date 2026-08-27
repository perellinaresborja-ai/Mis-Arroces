// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 20

export async function fetchFeedPage(pageIndex: number = 0) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const offset = pageIndex * PAGE_SIZE

  let query = supabase.from("feed_items").select("*").order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  let followStatusMap: Record<string, string> = {}
  if (user) {
    const { data: follows } = await supabase.from("follows").select("following_id, status").eq("follower_id", user.id)
    const followingIds = follows?.filter(f => f.status === 'ACCEPTED').map(f => f.following_id) || []
    followStatusMap = follows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {}
    const allowedAuthors = [user.id, ...followingIds].map(id => `"${id}"`).join(",")

    query = query.or(`visibility.eq.PUBLIC,user_id.eq.${user.id},and(visibility.eq.FOLLOWERS,user_id.in.(${allowedAuthors}))`)
  } else {
    query = query.eq("visibility", "PUBLIC")
  }

  const { data: feedItems } = await query

  const postIds = feedItems?.filter(i => i.entity_type === 'post').map(i => i.entity_id).filter((id): id is string => id !== null) || []
  const recipeIds = feedItems?.filter(i => i.entity_type === 'recipe').map(i => i.entity_id).filter((id): id is string => id !== null) || []
  const sessionIds = feedItems?.filter(i => i.entity_type === 'session').map(i => i.entity_id).filter((id): id is string => id !== null) || []

  const [postsRes, recipesRes, sessionsRes, likesRes, commentsRes] = await Promise.all([
    postIds.length > 0 ? supabase.from("social_posts").select(`*, author:profiles!social_posts_author_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), post_media(display_order, media:media_assets(id, storage_path)), recipe:recipes(id, name)`).in("id", postIds) : { data: [] },
    recipeIds.length > 0 ? supabase.from("recipes").select(`*, author:profiles!recipes_owner_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), recipe_media(display_order, media:media_assets(id, storage_path))`).in("id", recipeIds) : { data: [] },
    sessionIds.length > 0 ? supabase.from("cooking_sessions").select(`*, author:profiles!cooking_sessions_user_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path)), session_media(display_order, media:media_assets(id, storage_path)), recipe:recipes(id, name)`).in("id", sessionIds) : { data: [] },
    user ? Promise.all([
      postIds.length > 0 ? supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds) : { data: [] },
      recipeIds.length > 0 ? supabase.from("recipe_likes").select("recipe_id").eq("user_id", user.id).in("recipe_id", recipeIds) : { data: [] },
      sessionIds.length > 0 ? supabase.from("session_likes").select("session_id").eq("user_id", user.id).in("session_id", sessionIds) : { data: [] }
    ]) : Promise.resolve([{data:[]}, {data:[]}, {data:[]}]),
    Promise.all([
      postIds.length > 0 ? supabase.from("post_likes").select("post_id").in("post_id", postIds) : { data: [] },
      recipeIds.length > 0 ? supabase.from("recipe_likes").select("recipe_id").in("recipe_id", recipeIds) : { data: [] },
      sessionIds.length > 0 ? supabase.from("session_likes").select("session_id").in("session_id", sessionIds) : { data: [] },
      postIds.length > 0 ? supabase.from("post_comments").select("post_id").eq("is_deleted", false).in("post_id", postIds) : { data: [] },
      recipeIds.length > 0 ? supabase.from("recipe_comments").select("recipe_id").eq("is_deleted", false).in("recipe_id", recipeIds) : { data: [] },
      sessionIds.length > 0 ? supabase.from("session_comments").select("session_id").eq("is_deleted", false).in("session_id", sessionIds) : { data: [] }
    ])
  ])

  const posts = postsRes.data || []
  const recipes = recipesRes.data || []
  const sessions = sessionsRes.data || []

  const userLikesPost = new Set(likesRes[0].data?.map(l => l.post_id))
  const userLikesRecipe = new Set(likesRes[1].data?.map(l => l.recipe_id))
  const userLikesSession = new Set(likesRes[2].data?.map(l => l.session_id))

  const postLikesCount = commentsRes[0].data?.reduce((acc: any, val: any) => { acc[val.post_id] = (acc[val.post_id] || 0) + 1; return acc }, {})
  const recipeLikesCount = commentsRes[1].data?.reduce((acc: any, val: any) => { acc[val.recipe_id] = (acc[val.recipe_id] || 0) + 1; return acc }, {})
  const sessionLikesCount = commentsRes[2].data?.reduce((acc: any, val: any) => { acc[val.session_id] = (acc[val.session_id] || 0) + 1; return acc }, {})
  
  const postCommentsCount = commentsRes[3].data?.reduce((acc: any, val: any) => { acc[val.post_id] = (acc[val.post_id] || 0) + 1; return acc }, {})
  const recipeCommentsCount = commentsRes[4].data?.reduce((acc: any, val: any) => { acc[val.recipe_id] = (acc[val.recipe_id] || 0) + 1; return acc }, {})
  const sessionCommentsCount = commentsRes[5].data?.reduce((acc: any, val: any) => { acc[val.session_id] = (acc[val.session_id] || 0) + 1; return acc }, {})

  const enriched = feedItems?.filter(item => item.entity_id).map(item => {
    const entityId = item.entity_id as string;
    if (item.entity_type === 'post') {
      const data = posts.find(p => p.id === entityId)
      if (!data) return null
      return { ...item, data, isLiked: userLikesPost.has(entityId), likeCount: postLikesCount?.[entityId] || 0, commentCount: postCommentsCount?.[entityId] || 0, followStatus: typeof followStatusMap !== "undefined" ? followStatusMap[data.author?.id] || null : null }
    }
    if (item.entity_type === 'recipe') {
      const data = recipes.find(r => r.id === entityId)
      if (!data) return null
      return { ...item, data, isLiked: userLikesRecipe.has(entityId), likeCount: recipeLikesCount?.[entityId] || 0, commentCount: recipeCommentsCount?.[entityId] || 0, followStatus: typeof followStatusMap !== "undefined" ? followStatusMap[data.author?.id] || null : null }
    }
    if (item.entity_type === 'session') {
      const data = sessions.find(s => s.id === entityId)
      if (!data) return null
      return { ...item, data, isLiked: userLikesSession.has(entityId), likeCount: sessionLikesCount?.[entityId] || 0, commentCount: sessionCommentsCount?.[entityId] || 0, followStatus: typeof followStatusMap !== "undefined" ? followStatusMap[data.author?.id] || null : null }
    }
    return null
  }).filter(Boolean) || []

  return enriched
}
