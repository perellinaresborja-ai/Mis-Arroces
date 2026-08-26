import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronRight, Settings, Shield, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { signOutAction } from "@/app/actions/logout"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, privacy_level")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 flex justify-center">
      <div className="w-full max-w-lg space-y-6 md:mt-8 p-4 md:p-0">
        
        <header className="flex items-center gap-4 mb-4">
          <Link href={`/@${profile.username}`} className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </header>

        <div className="space-y-8">
          
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2">Cuenta</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <Link href="/profile/edit" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Editar perfil</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/profile/requests" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Solicitudes de seguimiento</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          <div className="pt-4">
            <form action={signOutAction}>
              <Button variant="outline" className="w-full h-14 rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors font-bold shadow-sm" type="submit">
                <LogOut className="w-5 h-5 mr-2" /> Cerrar Sesión
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
