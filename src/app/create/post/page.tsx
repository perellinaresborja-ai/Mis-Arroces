import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PostForm } from "./PostForm"
import { createClient } from "@/lib/supabase/server"

export default async function CreatePostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's recipes to link
  const { data: recipes } = await supabase.from("recipes").select("id, name").eq("owner_id", user?.id || "").order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24 md:pb-8">
      <div className="w-full max-w-lg space-y-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
        
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear</h1>
          <p className="text-muted-foreground">�Qu� quieres compartir hoy?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/create" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border hover:border-primary/50 text-foreground font-medium transition-colors">
            Receta
          </Link>
          <Link href="/create/post" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary font-medium">
            Publicaci�n
          </Link>
        </div>

        <PostForm recipes={recipes || []} />
      </div>
    </div>
  )
}

