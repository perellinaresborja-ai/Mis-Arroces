import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

export default async function CookbookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*, media:recipe_media(media_assets(storage_path))")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 pb-24 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Mi Recetario</h1>
        <Link href="/create">
          <Button size="icon" variant="ghost" className="text-primary">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      {recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {recipes.map(recipe => {
            const primaryMedia = recipe.media?.[0]?.media_assets?.storage_path
            const imageUrl = primaryMedia 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${primaryMedia}`
              : null

            return (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-card border border-border shadow-sm flex flex-col">
                <div className="flex-1 bg-muted relative">
                  {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-sand p-2 text-center">
                      Sin foto
                    </div>
                  )}
                  {recipe.status === "DRAFT" && (
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-foreground">
                      Borrador
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border bg-card">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{recipe.name}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">🥘</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Tu recetario está vacío</h3>
            <p className="text-sm text-muted-foreground">Aún no has guardado ningún arroz.</p>
          </div>
          <Link href="/create" className={cn(buttonVariants(), "mt-2")}>
            Crear mi primer arroz
          </Link>
        </div>
      )}
    </div>
  )
}
