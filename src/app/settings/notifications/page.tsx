import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import NotificationsForm from "./components/NotificationsForm"

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth")
  }

  const { data: prefs } = await supabase.from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
        </header>

        <div className="bg-card rounded-3xl border border-border overflow-hidden p-6">
          <NotificationsForm initialPrefs={prefs} />
        </div>
      </div>
    </div>
  )
}


