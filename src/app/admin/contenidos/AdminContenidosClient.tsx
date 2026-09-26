"use client"

import { useState, useMemo } from "react"
import {
  UtensilsCrossed,
  Image as ImageIcon,
  Radio,
  Music,
  Search,
  Filter,
  ExternalLink,
  Eye,
  EyeOff,
  Pin,
  MessageSquare,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import {
  toggleRecipeStatusAdmin,
  togglePostOptionsAdmin,
  expireStoryAdmin,
} from "@/app/actions/admin"

export interface AdminRecipeItem {
  id: string
  name: string
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | string
  createdAt: string
  servings: number | null
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  mediaUrl: string | null
}

export interface AdminPostItem {
  id: string
  content: string | null
  createdAt: string
  deletedAt: string | null
  allowComments: boolean
  isPinned: boolean
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  media: { storage_path: string }[]
}

export interface AdminStoryItem {
  id: string
  createdAt: string
  expiresAt: string
  isActive: boolean
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  mediaUrl: string | null
}

interface AdminContenidosClientProps {
  recipes: AdminRecipeItem[]
  posts: AdminPostItem[]
  stories: AdminStoryItem[]
}

export function AdminContenidosClient({
  recipes,
  posts,
  stories,
}: AdminContenidosClientProps) {
  const [activeTab, setActiveTab] = useState<"recipes" | "posts" | "stories">("recipes")
  const [searchTerm, setSearchTerm] = useState("")
  const [recipeStatusFilter, setRecipeStatusFilter] = useState("ALL")
  const [actionLoading, setActionLoading] = useState(false)

  // Filtrado de recetas
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const q = searchTerm.toLowerCase().trim()
      if (q) {
        const matchesName = r.name.toLowerCase().includes(q)
        const matchesAuthor = (r.author?.username || "").toLowerCase().includes(q)
        if (!matchesName && !matchesAuthor) return false
      }
      if (recipeStatusFilter !== "ALL" && r.status !== recipeStatusFilter) return false
      return true
    })
  }, [recipes, searchTerm, recipeStatusFilter])

  // Filtrado de posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = searchTerm.toLowerCase().trim()
      if (q) {
        const matchesContent = (p.content || "").toLowerCase().includes(q)
        const matchesAuthor = (p.author?.username || "").toLowerCase().includes(q)
        if (!matchesContent && !matchesAuthor) return false
      }
      return true
    })
  }, [posts, searchTerm])

  // Filtrado de stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const q = searchTerm.toLowerCase().trim()
      if (q) {
        return (s.author?.username || "").toLowerCase().includes(q)
      }
      return true
    })
  }, [stories, searchTerm])

  // Acciones
  const handleToggleRecipeStatus = async (recipe: AdminRecipeItem) => {
    const nextStatus = recipe.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    const confirmText =
      nextStatus === "DRAFT"
        ? `¿Ocultar/retirar la receta "${recipe.name}" de la vista pública?`
        : `¿Publicar y hacer visible la receta "${recipe.name}"?`

    if (!confirm(confirmText)) return

    setActionLoading(true)
    try {
      await toggleRecipeStatusAdmin(recipe.id, nextStatus)
      recipe.status = nextStatus
    } catch (e: any) {
      alert(e.message || "Error al actualizar estado")
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePostPin = async (post: AdminPostItem) => {
    const nextVal = !post.isPinned
    setActionLoading(true)
    try {
      await togglePostOptionsAdmin(post.id, "is_pinned", nextVal)
      post.isPinned = nextVal
    } catch (e: any) {
      alert(e.message || "Error al fijar")
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePostComments = async (post: AdminPostItem) => {
    const nextVal = !post.allowComments
    setActionLoading(true)
    try {
      await togglePostOptionsAdmin(post.id, "allow_comments", nextVal)
      post.allowComments = nextVal
    } catch (e: any) {
      alert(e.message || "Error al cambiar comentarios")
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePostHide = async (post: AdminPostItem) => {
    const isCurrentlyHidden = Boolean(post.deletedAt)
    const confirmText = isCurrentlyHidden ? "¿Restaurar publicación?" : "¿Ocultar esta publicación del feed?"
    if (!confirm(confirmText)) return

    setActionLoading(true)
    try {
      await togglePostOptionsAdmin(post.id, "hide", !isCurrentlyHidden)
      post.deletedAt = !isCurrentlyHidden ? new Date().toISOString() : null
    } catch (e: any) {
      alert(e.message || "Error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleExpireStory = async (story: AdminStoryItem) => {
    if (!confirm("¿Retirar y expirar esta Story anticipadamente?")) return
    setActionLoading(true)
    try {
      await expireStoryAdmin(story.id)
      story.isActive = false
    } catch (e: any) {
      alert(e.message || "Error al expirar story")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Contenidos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control editorial de recetas, publicaciones sociales, Stories y catálogo musical.
            </p>
          </div>
        </div>

        {/* Acceso directo a Música de Stories */}
        <Link
          href="/admin/contenidos/musica"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm self-start sm:self-auto"
        >
          <Music className="w-4 h-4" />
          <span>Catálogo Musical</span>
        </Link>
      </div>

      {/* 2. Selector de Sección (Pestañas) */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("recipes")
            setSearchTerm("")
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "recipes"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Recetas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20">
            {recipes.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("posts")
            setSearchTerm("")
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "posts"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Publicaciones</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20">
            {posts.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("stories")
            setSearchTerm("")
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "stories"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Stories</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20">
            {stories.filter((s) => s.isActive).length}
          </span>
        </button>
      </div>

      {/* 3. Buscador y Filtros */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              activeTab === "recipes"
                ? "Buscar por receta o autor..."
                : activeTab === "posts"
                ? "Buscar por texto o autor..."
                : "Buscar por @autor..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/40 border border-border/80 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>

        {activeTab === "recipes" && (
          <select
            value={recipeStatusFilter}
            onChange={(e) => setRecipeStatusFilter(e.target.value)}
            className="bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 text-xs font-semibold self-start sm:self-auto"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="DRAFT">Borradores / Ocultas</option>
            <option value="SCHEDULED">Programadas</option>
          </select>
        )}
      </div>

      {/* 4. Tablas / Contenido */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* TABLA RECETAS */}
        {activeTab === "recipes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4">Receta</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Raciones</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecipes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No se encontraron recetas.
                    </td>
                  </tr>
                ) : (
                  filteredRecipes.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/recipes/${r.id}`}
                          target="_blank"
                          className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[220px]">{r.name}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                        </Link>
                      </td>
                      <td className="p-4 text-xs">
                        {r.author ? (
                          <Link
                            href={`/@${r.author.username}`}
                            target="_blank"
                            className="flex items-center gap-2 hover:underline"
                          >
                            <ProfileAvatar avatarUrl={r.author.avatarUrl} username={r.author.username} />
                            <span>@{r.author.username}</span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {r.status === "PUBLISHED" ? "Publicada" : r.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-muted-foreground">
                        {r.servings ? `${r.servings} pax` : "—"}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleRecipeStatus(r)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            r.status === "PUBLISHED"
                              ? "bg-muted border border-border hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground"
                              : "bg-primary text-white"
                          }`}
                        >
                          {r.status === "PUBLISHED" ? "Ocultar" : "Publicar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA PUBLICACIONES */}
        {activeTab === "posts" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4">Publicación</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Medios</th>
                  <th className="p-4">Comentarios</th>
                  <th className="p-4">Fijado</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron publicaciones.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((p) => {
                    const isHidden = Boolean(p.deletedAt)
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 max-w-[260px]">
                          <Link
                            href={`/posts/${p.id}`}
                            target="_blank"
                            className="text-xs text-foreground hover:text-primary line-clamp-2 leading-relaxed"
                          >
                            {p.content || <span className="italic text-muted-foreground">Sin texto</span>}
                          </Link>
                          {isHidden && (
                            <span className="text-[10px] font-black text-rose-600 bg-rose-500/10 px-1.5 py-0.2 rounded mt-1 inline-block">
                              OCULTO
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs">
                          {p.author ? (
                            <Link href={`/@${p.author.username}`} target="_blank" className="hover:underline">
                              @{p.author.username}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-bold text-muted-foreground">
                          {p.media?.length || 0} fotos/vídeos
                        </td>
                        <td className="p-4">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleTogglePostComments(p)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold border transition ${
                              p.allowComments
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {p.allowComments ? "Activos" : "Desactivados"}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleTogglePostPin(p)}
                            className={`p-1.5 rounded-xl border transition ${
                              p.isPinned
                                ? "bg-amber-500/20 text-amber-600 border-amber-500/40"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                            }`}
                            title={p.isPinned ? "Desfijar post" : "Fijar en perfil"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleTogglePostHide(p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              isHidden
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-card border-border hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground"
                            }`}
                          >
                            {isHidden ? "Restaurar" : "Ocultar"}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA STORIES */}
        {activeTab === "stories" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4">Story</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Publicada</th>
                  <th className="p-4">Caduca</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No se encontraron Stories.
                    </td>
                  </tr>
                ) : (
                  filteredStories.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-16 rounded-xl overflow-hidden bg-muted border border-border relative">
                          {s.mediaUrl ? (
                            <img
                              src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/story_media/${s.mediaUrl}`}
                              alt="Story"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Radio className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        {s.author ? (
                          <Link href={`/@${s.author.username}`} target="_blank" className="hover:underline">
                            @{s.author.username}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-4">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Activa
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Expirada
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(s.expiresAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        {s.isActive && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleExpireStory(s)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border hover:bg-rose-500/10 hover:text-rose-600 transition"
                          >
                            Expirar ahora
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
