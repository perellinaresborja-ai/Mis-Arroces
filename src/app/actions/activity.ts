"use server"

import { createClient } from "@/lib/supabase/server"

export interface RealUserActivity {
  id: string
  activity_type: "LIKE" | "COMMENT" | "SAVE" | "COOK" | "RECIPE" | "POST"
  title: string
  description: string | null
  occurred_at: string
  url: string | null
}

export async function fetchUserRealActivity(userId: string, limit = 20): Promise<RealUserActivity[]> {
  const supabase = await createClient()

  try {
    const [
      postLikesRes,
      recipeLikesRes,
      sessionLikesRes,
      postCommentsRes,
      recipeCommentsRes,
      sessionCommentsRes,
      savesRes,
      recipesRes,
      sessionsRes,
      postsRes
    ] = await Promise.all([
      supabase.from("post_likes").select("post_id, created_at, post:social_posts(id, content)").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("recipe_likes").select("recipe_id, created_at, recipe:recipes(id, name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("session_likes").select("session_id, created_at, session:cooking_sessions(id, notes, recipe:recipes(name))").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("post_comments").select("id, post_id, content, created_at").eq("author_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("recipe_comments").select("id, recipe_id, content, created_at, recipe:recipes(id, name)").eq("author_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("session_comments").select("id, session_id, content, created_at, session:cooking_sessions(id, recipe:recipes(name))").eq("author_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("saves").select("recipe_id, created_at, recipe:recipes(id, name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("recipes").select("id, name, created_at").eq("owner_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("cooking_sessions").select("id, created_at, date, recipe:recipes(name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("social_posts").select("id, content, created_at").eq("author_id", userId).order("created_at", { ascending: false }).limit(limit),
    ])

    const items: RealUserActivity[] = []

    // 1. Post Likes
    ;(postLikesRes.data || []).forEach((item: any) => {
      if (item.post) {
        items.push({
          id: `like-post-${item.post_id}`,
          activity_type: "LIKE",
          title: "Te gustó una publicación",
          description: item.post.content ? (item.post.content.length > 80 ? item.post.content.slice(0, 77) + "..." : item.post.content) : null,
          occurred_at: item.created_at,
          url: `/posts/${item.post_id}`
        })
      }
    })

    // 2. Recipe Likes
    ;(recipeLikesRes.data || []).forEach((item: any) => {
      if (item.recipe) {
        items.push({
          id: `like-recipe-${item.recipe_id}`,
          activity_type: "LIKE",
          title: "Te gustó una receta",
          description: item.recipe.name,
          occurred_at: item.created_at,
          url: `/recipes/${item.recipe_id}`
        })
      }
    })

    // 3. Session Likes
    ;(sessionLikesRes.data || []).forEach((item: any) => {
      if (item.session) {
        items.push({
          id: `like-session-${item.session_id}`,
          activity_type: "LIKE",
          title: "Te gustó un cocinado",
          description: item.session.recipe?.name || item.session.notes || "Elaboración de arroz",
          occurred_at: item.created_at,
          url: `/sessions/${item.session_id}`
        })
      }
    })

    // 4. Post Comments
    ;(postCommentsRes.data || []).forEach((item: any) => {
      items.push({
        id: `comment-post-${item.id}`,
        activity_type: "COMMENT",
        title: "Comentaste en una publicación",
        description: item.content ? (item.content.length > 80 ? item.content.slice(0, 77) + "..." : item.content) : null,
        occurred_at: item.created_at,
        url: `/posts/${item.post_id}`
      })
    })

    // 5. Recipe Comments
    ;(recipeCommentsRes.data || []).forEach((item: any) => {
      items.push({
        id: `comment-recipe-${item.id}`,
        activity_type: "COMMENT",
        title: `Comentaste en ${item.recipe?.name || "una receta"}`,
        description: item.content ? (item.content.length > 80 ? item.content.slice(0, 77) + "..." : item.content) : null,
        occurred_at: item.created_at,
        url: `/recipes/${item.recipe_id}`
      })
    })

    // 6. Session Comments
    ;(sessionCommentsRes.data || []).forEach((item: any) => {
      items.push({
        id: `comment-session-${item.id}`,
        activity_type: "COMMENT",
        title: "Comentaste en una elaboración",
        description: item.content ? (item.content.length > 80 ? item.content.slice(0, 77) + "..." : item.content) : null,
        occurred_at: item.created_at,
        url: `/sessions/${item.session_id}`
      })
    })

    // 7. Saves
    ;(savesRes.data || []).forEach((item: any) => {
      if (item.recipe) {
        items.push({
          id: `save-${item.recipe_id}`,
          activity_type: "SAVE",
          title: "Guardaste una receta",
          description: item.recipe.name,
          occurred_at: item.created_at,
          url: `/recipes/${item.recipe_id}`
        })
      }
    })

    // 8. Recipes created
    ;(recipesRes.data || []).forEach((item: any) => {
      items.push({
        id: `recipe-created-${item.id}`,
        activity_type: "RECIPE",
        title: "Publicaste una receta",
        description: item.name,
        occurred_at: item.created_at,
        url: `/recipes/${item.id}`
      })
    })

    // 9. Sessions cooked
    ;(sessionsRes.data || []).forEach((item: any) => {
      items.push({
        id: `session-created-${item.id}`,
        activity_type: "COOK",
        title: "Registraste un cocinado",
        description: item.recipe?.name || "Sesión de arroz",
        occurred_at: item.created_at || item.date,
        url: `/sessions/${item.id}`
      })
    })

    // 10. Posts published
    ;(postsRes.data || []).forEach((item: any) => {
      items.push({
        id: `post-created-${item.id}`,
        activity_type: "POST",
        title: "Publicaste una actualización",
        description: item.content ? (item.content.length > 80 ? item.content.slice(0, 77) + "..." : item.content) : null,
        occurred_at: item.created_at,
        url: `/posts/${item.id}`
      })
    })

    // Sort descending by occurred_at
    items.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())

    return items.slice(0, limit)
  } catch (err) {
    console.error("Error fetching user real activity:", err)
    return []
  }
}
