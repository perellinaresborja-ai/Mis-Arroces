// @ts-nocheck
"use client"

import { useState } from "react"
import { FeedCard } from "@/components/domain/FeedCard"
import { fetchFeedPage } from "@/app/actions/feed"
import { Button } from "@/components/ui/button"

export function FeedList({ initialItems, currentUserId }: { initialItems: any[], currentUserId: string | null }) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialItems.length === 20)

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      const nextItems = await fetchFeedPage(page)
      setItems(prev => {
        // deduplicate just in case
        const existingIds = new Set(prev.filter(i => i && (i as any).entity_id).map(i => `${(i as any).entity_type}-${(i as any).entity_id}`))
        const newUnique = nextItems.filter(i => i && (i as any).entity_id && !existingIds.has(`${(i as any).entity_type}-${(i as any).entity_id}`))
        return [...prev, ...newUnique]
      })
      if (nextItems.length < 20) {
        setHasMore(false)
      }
      setPage(prev => prev + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item: any) => {
        if ((item as any).entity_type === 'post') {
          const media = item.data.post_media?.sort((a,b)=>(a.display_order||0)-(b.display_order||0)).map((pm: any) => pm.media).filter(Boolean) || []
          return (
            <FeedCard 
              key={`${(item as any).entity_type}-${(item as any).entity_id}`}
              entityType="post"
              entityId={(item as any).entity_id}
              user={item.data.author}
              createdAt={item.created_at}
              reactions={item.reactions}
              commentCount={item.commentCount}
              currentUserId={currentUserId}
              followStatus={(item as any).followStatus}
              postContent={item.data.content}
              linkedRecipe={item.data.recipe}
              media={media}
            />
          )
        }

        if ((item as any).entity_type === 'recipe') {
          const media = item.data.recipe_media?.sort((a,b)=>(a.display_order||0)-(b.display_order||0)).map((rm: any) => rm.media).filter(Boolean) || []
          return (
            <FeedCard 
              key={`${(item as any).entity_type}-${(item as any).entity_id}`}
              entityType="recipe"
              entityId={(item as any).entity_id}
              user={item.data.author}
              createdAt={item.created_at}
              reactions={item.reactions}
              commentCount={item.commentCount}
              currentUserId={currentUserId}
              followStatus={(item as any).followStatus}
              recipeName={item.data.name}
              recipeType={item.data.rice_type}
              media={media}
            />
          )
        }

        if ((item as any).entity_type === 'session') {
          const media = item.data.session_media?.sort((a,b)=>(a.display_order||0)-(b.display_order||0)).map((sm: any) => sm.media).filter(Boolean) || []
          return (
            <FeedCard 
              key={`${(item as any).entity_type}-${(item as any).entity_id}`}
              entityType="session"
              entityId={(item as any).entity_id}
              user={item.data.author}
              createdAt={item.created_at}
              reactions={item.reactions}
              commentCount={item.commentCount}
              currentUserId={currentUserId}
              followStatus={(item as any).followStatus}
              sessionRating={item.data.rating}
              sessionSocarrat={item.data.socarrat_level}
              linkedRecipe={item.data.recipe}
              media={media}
            />
          )
        }
      })}

      {hasMore && (
        <div className="pt-4 text-center">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="rounded-xl w-full h-12">
            {loading ? "Cargando..." : "Ver más"}
          </Button>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm font-medium">
          No hay más contenido. ¡Vuelve pronto!
        </div>
      )}
    </div>
  )
}

