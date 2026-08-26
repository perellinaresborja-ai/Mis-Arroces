import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoryForm } from "./StoryForm"

export default async function CreateStoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24 md:pb-8 bg-background">
      <div className="w-full max-w-lg space-y-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
        <header className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold">Tu historia</h1>
          <p className="text-muted-foreground">Comparte un momento arrocero</p>
        </header>
        <StoryForm />
      </div>
    </div>
  )
}
