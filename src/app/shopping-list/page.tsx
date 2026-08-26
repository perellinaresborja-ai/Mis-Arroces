import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShoppingListClient } from "./ShoppingListClient"

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?returnTo=/shopping-list")
  }

  // Fetch list
  const { data: list } = await supabase
    .from("shopping_lists")
    .select("*, items:shopping_list_items(*, unit:units(id, name), recipe:recipes(name))")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-6">
      <div className="w-full max-w-lg mx-auto px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-6">Mi lista de compra</h1>
        
        {!list || !list.items || list.items.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
            <p className="text-muted-foreground">Tu lista está vacía.</p>
            <p className="text-sm text-muted-foreground mt-2">Añade ingredientes desde cualquier receta.</p>
          </div>
        ) : (
          <ShoppingListClient listId={list.id} initialItems={list.items} />
        )}
      </div>
    </div>
  )
}
