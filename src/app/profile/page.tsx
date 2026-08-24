import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Lock, Globe } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen flex-col p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{profile.display_name}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Privacidad de cuenta</span>
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {profile.privacy_level === "PUBLIC" ? (
                <><Globe className="w-4 h-4 mr-2" /> Público</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" /> Privado</>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tipo de cuenta</span>
            <span className="text-sm text-muted-foreground">{profile.account_type}</span>
          </div>
        </div>
      </div>

      <form action={logout} className="mt-8">
        <Button variant="outline" className="w-full h-12 text-destructive border-destructive/20 hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </form>
    </div>
  )
}
