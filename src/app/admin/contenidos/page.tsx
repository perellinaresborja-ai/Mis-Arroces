import { requireAdminSession } from "@/lib/admin/auth"
import { getAdminClient } from "@/lib/admin/client"
import {
  AdminContenidosClient,
  AdminRecipeItem,
  AdminPostItem,
  AdminStoryItem,
} from "./AdminContenidosClient"

export const dynamic = "force-dynamic"

export default async function AdminContenidosPage() {
  await requireAdminSession("MODERATOR")
  const adminClient = getAdminClient()

  const [recipesRes, postsRes, storiesRes] = await Promise.all([
    adminClient
      .from("recipes")
      .select(`
        id, name, status, created_at, base_servings,
        author:profiles!recipes_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        media:recipe_media(media:media_assets(storage_path))
      `)
      .order("created_at", { ascending: false })
      .limit(100),
    adminClient
      .from("social_posts")
      .select(`
        id, content, created_at, status, allow_comments, is_pinned,
        author:profiles!social_posts_author_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        media:post_media(media:media_assets(storage_path))
      `)
      .order("created_at", { ascending: false })
      .limit(100),
    adminClient
      .from("stories")
      .select(`
        id, created_at, expires_at,
        author:profiles!stories_owner_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)),
        media:story_media(media:media_assets(storage_path))
      `)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const recipes: AdminRecipeItem[] = (recipesRes.data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    servings: r.base_servings,
    author: r.author
      ? {
          id: r.author.id,
          username: r.author.username,
          displayName: r.author.display_name,
          avatarUrl: r.author.avatar?.storage_path || null,
        }
      : null,
    mediaUrl: r.media?.[0]?.media?.storage_path || null,
  }))

  const posts: AdminPostItem[] = (postsRes.data || []).map((p: any) => ({
    id: p.id,
    content: p.content,
    createdAt: p.created_at,
    deletedAt: p.status === "DRAFT" ? p.created_at : null,
    allowComments: p.allow_comments !== false,
    isPinned: Boolean(p.is_pinned),
    author: p.author
      ? {
          id: p.author.id,
          username: p.author.username,
          displayName: p.author.display_name,
          avatarUrl: p.author.avatar?.storage_path || null,
        }
      : null,
    media: (p.media || []).map((m: any) => ({ storage_path: m.media?.storage_path })),
  }))

  const nowIso = new Date().toISOString()
  const stories: AdminStoryItem[] = (storiesRes.data || []).map((s: any) => ({
    id: s.id,
    createdAt: s.created_at,
    expiresAt: s.expires_at,
    isActive: s.expires_at > nowIso,
    author: s.author
      ? {
          id: s.author.id,
          username: s.author.username,
          displayName: s.author.display_name,
          avatarUrl: s.author.avatar?.storage_path || null,
        }
      : null,
    mediaUrl: s.media?.[0]?.media?.storage_path || null,
  }))

  return (
    <AdminContenidosClient
      recipes={recipes}
      posts={posts}
      stories={stories}
    />
  )
}
